import { WeekcalendarSettings } from '../types';
import { AutomaticSyncOutcome } from '../commands/sync-calendar';
import { getInitialSyncStatus, SyncStatus } from './sync-status';

export function createAutomaticSyncCoordinator(
  settings: WeekcalendarSettings,
  runAutomatic: () => Promise<AutomaticSyncOutcome>,
  reportStatus: (status: SyncStatus) => void,
) {
  let disposed = false;
  let revision = 0;
  let pending = false;
  let localPending = false;
  let localFailed = false;
  let running = false;
  let waitingForIdle = false;
  let idleRevision = 0;
  let lastChange = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const publish = (status: SyncStatus) => {
    if (!disposed) reportStatus(settings.caldav.autoSync === true ? status : 'off');
  };
  const schedule = () => {
    clearTimeout(timer);
    timer = undefined;
    if (disposed || !pending || localPending || localFailed || running || waitingForIdle) return;
    const initial = getInitialSyncStatus(settings.caldav);
    if (initial !== 'not-checked') {
      publish(initial);
      return;
    }
    timer = setTimeout(() => { timer = undefined; void run(); }, Math.max(0, lastChange + 5000 - Date.now()));
  };
  const run = async () => {
    if (disposed || running || localPending || localFailed || !pending) return;
    if (getInitialSyncStatus(settings.caldav) !== 'not-checked') { schedule(); return; }
    running = true;
    const startedAtRevision = revision;
    const startedAtIdleRevision = idleRevision;
    let outcome: AutomaticSyncOutcome;
    try {
      outcome = await runAutomatic();
    } catch {
      outcome = { status: 'error' };
    } finally {
      running = false;
    }
    if (disposed) return;
    if (revision !== startedAtRevision) {
      publish(localFailed ? 'error' : 'pending');
      schedule();
      return;
    }
    if (outcome.status === 'busy') {
      waitingForIdle = idleRevision === startedAtIdleRevision;
      publish('pending');
      schedule();
      return;
    }
    pending = false;
    const status = outcome.status === 'stale' || outcome.status === 'cancelled'
      ? getInitialSyncStatus(settings.caldav) : outcome.status;
    publish(status);
  };
  const changed = () => {
    if (disposed) return;
    revision++;
    pending = true;
    localFailed = false;
    lastChange = Date.now();
    publish(getInitialSyncStatus(settings.caldav) === 'not-checked' ? 'pending' : getInitialSyncStatus(settings.caldav));
    schedule();
  };

  return {
    changed,
    configurationChanged: changed,
    processingPending(): void {
      if (disposed) return;
      localPending = true;
      clearTimeout(timer);
      timer = undefined;
    },
    processingSettled(success: boolean): void {
      if (disposed) return;
      localPending = false;
      localFailed = !success;
      if (!success) publish('error');
      schedule();
    },
    idle(): void {
      if (disposed) return;
      idleRevision++;
      waitingForIdle = false;
      schedule();
    },
    reportWorkerStatus(status: SyncStatus): void {
      if (disposed) return;
      if (pending && (status === 'synced' || status === 'error' || status === 'pending')) {
        publish(localFailed ? 'error' : 'pending');
      } else publish(status);
    },
    dispose(): void {
      disposed = true;
      clearTimeout(timer);
      timer = undefined;
    },
  };
}
