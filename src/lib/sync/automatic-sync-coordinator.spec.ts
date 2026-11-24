import { createAutomaticSyncCoordinator } from './automatic-sync-coordinator';
import { mergeSettings } from '../settings/load-settings';
import { AutomaticSyncOutcome } from '../commands/sync-calendar';

describe('automatic sync quiet-time coordinator', () => {
  const settings = () => mergeSettings({ caldav: {
    autoSync: true, url: 'https://example.com/', username: 'user', password: 'secret',
    calendar: 'https://example.com/calendar/', managedCalendarConfirmed: true,
  } });
  beforeEach(() => { jest.useFakeTimers(); jest.setSystemTime(0); });
  afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); });

  it('does not run at startup and batches a burst into one run five seconds after the final change', async () => {
    const run = jest.fn().mockResolvedValue({ status: 'synced' });
    const coordinator = createAutomaticSyncCoordinator(settings(), run, jest.fn());
    await jest.advanceTimersByTimeAsync(60000);
    expect(run).not.toHaveBeenCalled();
    coordinator.changed();
    await jest.advanceTimersByTimeAsync(4000);
    coordinator.changed();
    await jest.advanceTimersByTimeAsync(4999);
    expect(run).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(run).toHaveBeenCalledTimes(1);
    coordinator.dispose();
  });

  it('waits for local processing even when quiet time has already elapsed', async () => {
    const run = jest.fn().mockResolvedValue({ status: 'synced' });
    const coordinator = createAutomaticSyncCoordinator(settings(), run, jest.fn());
    coordinator.changed();
    coordinator.processingPending();
    await jest.advanceTimersByTimeAsync(10000);
    expect(run).not.toHaveBeenCalled();
    coordinator.processingSettled(true);
    await jest.advanceTimersByTimeAsync(0);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('does not bypass the remaining quiet time when processing finishes early', async () => {
    const run = jest.fn().mockResolvedValue({ status: 'synced' });
    const coordinator = createAutomaticSyncCoordinator(settings(), run, jest.fn());
    coordinator.changed();
    coordinator.processingPending();
    await jest.advanceTimersByTimeAsync(1000);
    coordinator.processingSettled(true);
    await jest.advanceTimersByTimeAsync(3999);
    expect(run).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('retains edits during an active run and does not accept its obsolete success as synchronized', async () => {
    let resolve!: (outcome: AutomaticSyncOutcome) => void;
    const run = jest.fn().mockResolvedValue({ status: 'synced' })
      .mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    const status = jest.fn();
    const coordinator = createAutomaticSyncCoordinator(settings(), run, status);
    coordinator.changed();
    await jest.advanceTimersByTimeAsync(5000);
    coordinator.changed();
    coordinator.processingPending();
    coordinator.reportWorkerStatus('synced');
    expect(status).toHaveBeenLastCalledWith('pending');
    resolve({ status: 'synced' });
    await jest.advanceTimersByTimeAsync(10000);
    expect(run).toHaveBeenCalledTimes(1);
    coordinator.processingSettled(true);
    await jest.advanceTimersByTimeAsync(0);
    expect(run).toHaveBeenCalledTimes(2);
    expect(status).toHaveBeenLastCalledWith('synced');
  });

  it('waits for the shared lock to become idle instead of polling a pending manual confirmation', async () => {
    const run = jest.fn().mockResolvedValue({ status: 'synced' }).mockResolvedValueOnce({ status: 'busy' });
    const coordinator = createAutomaticSyncCoordinator(settings(), run, jest.fn());
    coordinator.changed();
    await jest.advanceTimersByTimeAsync(65000);
    expect(run).toHaveBeenCalledTimes(1);
    coordinator.idle();
    await jest.advanceTimersByTimeAsync(0);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it.each(['error', 'confirmation-required'] as const)('does not retry %s without a new change', async (outcome) => {
    const run = jest.fn().mockResolvedValue({ status: outcome });
    const coordinator = createAutomaticSyncCoordinator(settings(), run, jest.fn());
    coordinator.changed();
    await jest.advanceTimersByTimeAsync(65000);
    expect(run).toHaveBeenCalledTimes(1);
    coordinator.changed();
    await jest.advanceTimersByTimeAsync(5000);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('does not miss an idle signal delivered before the busy outcome resolves', async () => {
    let resolve!: (outcome: AutomaticSyncOutcome) => void;
    const run = jest.fn().mockResolvedValue({ status: 'synced' })
      .mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    const coordinator = createAutomaticSyncCoordinator(settings(), run, jest.fn());
    coordinator.changed();
    await jest.advanceTimersByTimeAsync(5000);
    coordinator.idle();
    resolve({ status: 'busy' });
    await jest.advanceTimersByTimeAsync(1);
    expect(run).toHaveBeenCalledTimes(2);
    coordinator.dispose();
  });

  it('blocks the server after a local processing error until another edit is processed', async () => {
    const run = jest.fn().mockResolvedValue({ status: 'synced' });
    const status = jest.fn();
    const coordinator = createAutomaticSyncCoordinator(settings(), run, status);
    coordinator.changed();
    coordinator.processingPending();
    coordinator.processingSettled(false);
    await jest.advanceTimersByTimeAsync(60000);
    expect(status).toHaveBeenLastCalledWith('error');
    expect(run).not.toHaveBeenCalled();
    coordinator.changed();
    coordinator.processingPending();
    coordinator.processingSettled(true);
    await jest.advanceTimersByTimeAsync(5000);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('cancels queued work when disabled and starts a new quiet window when enabled', async () => {
    const config = settings();
    const run = jest.fn().mockResolvedValue({ status: 'synced' });
    const coordinator = createAutomaticSyncCoordinator(config, run, jest.fn());
    coordinator.changed();
    config.caldav.autoSync = false;
    coordinator.configurationChanged();
    await jest.advanceTimersByTimeAsync(60000);
    expect(run).not.toHaveBeenCalled();
    config.caldav.autoSync = true;
    coordinator.configurationChanged();
    await jest.advanceTimersByTimeAsync(4999);
    expect(run).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('requires complete calendar setup and explicit ownership before scheduling', async () => {
    const config = settings();
    config.caldav.managedCalendarConfirmed = false;
    const run = jest.fn();
    const status = jest.fn();
    const coordinator = createAutomaticSyncCoordinator(config, run, status);
    coordinator.changed();
    await jest.advanceTimersByTimeAsync(10000);
    expect(run).not.toHaveBeenCalled();
    expect(status).toHaveBeenLastCalledWith('setup-required');
  });

  it('removes timers and ignores late completions after disposal', async () => {
    let resolve!: (outcome: AutomaticSyncOutcome) => void;
    const run = jest.fn().mockReturnValue(new Promise((done) => { resolve = done; }));
    const status = jest.fn();
    const coordinator = createAutomaticSyncCoordinator(settings(), run, status);
    coordinator.changed();
    await jest.advanceTimersByTimeAsync(5000);
    coordinator.changed();
    coordinator.dispose();
    const count = status.mock.calls.length;
    resolve({ status: 'synced' });
    await jest.advanceTimersByTimeAsync(60000);
    expect(run).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledTimes(count);
    expect(jest.getTimerCount()).toBe(0);
  });
});
