import { CreateYearPrompt } from './create-year-prompt';

const mockSetDisabled = jest.fn().mockReturnThis();
const mockSetButtonText = jest.fn().mockReturnThis();
const mockSetCta = jest.fn().mockReturnThis();
const mockOnClick = jest.fn().mockReturnThis();
const mockSetName = jest.fn().mockReturnThis();
const mockAddText = jest.fn().mockReturnThis();
const mockAddButton = jest.fn().mockReturnThis();
const mockFocus = jest.fn();

let capturedTextOnChange: ((value: string) => void) | undefined;
let capturedButtonOnClick: (() => void) | undefined;

jest.mock('obsidian', () => {
  class Modal {
    app: unknown;
    contentEl = {
      empty: jest.fn(),
    };

    constructor(app: unknown) {
      this.app = app;
    }

    open() {}
    close() {}
  }

  class ButtonComponent {
    setButtonText = mockSetButtonText;
    setCta = mockSetCta;
    setDisabled = mockSetDisabled;
    onClick = jest.fn((callback: () => void) => {
      capturedButtonOnClick = callback;
      return this;
    });
  }

  class Setting {
    constructor(_containerEl: unknown) {}

    setName = mockSetName;

    addText = jest.fn(
      (
        callback: (text: {
          onChange: (cb: (value: string) => void) => unknown;
          inputEl: { focus: () => void };
        }) => void,
      ) => {
        const textComponent = {
          onChange: (cb: (value: string) => void) => {
            capturedTextOnChange = cb;
            return textComponent;
          },
          inputEl: {
            focus: mockFocus,
          },
        };

        callback(textComponent);
        return this;
      },
    );

    addButton = jest.fn((callback: (button: ButtonComponent) => void) => {
      const buttonComponent = new ButtonComponent();
      callback(buttonComponent);
      return this;
    });
  }

  return {
    Modal,
    Setting,
    ButtonComponent,
  };
});

describe('CreateYearPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedTextOnChange = undefined;
    capturedButtonOnClick = undefined;
  });

  it('disables submit initially and focuses input', () => {
    const onSubmit = jest.fn();
    const modal = new CreateYearPrompt({} as unknown as never, onSubmit);

    modal.onOpen();

    expect(mockSetButtonText).toHaveBeenCalledWith('OK');
    expect(mockSetCta).toHaveBeenCalled();
    expect(mockSetDisabled).toHaveBeenCalledWith(true);
    expect(mockFocus).toHaveBeenCalled();
  });

  it('enables submit for a valid 4-digit year', () => {
    const onSubmit = jest.fn();
    const modal = new CreateYearPrompt({} as unknown as never, onSubmit);

    modal.onOpen();

    capturedTextOnChange?.('2026');

    expect(mockSetDisabled).toHaveBeenLastCalledWith(false);
  });

  it('keeps submit disabled for an invalid value', () => {
    const onSubmit = jest.fn();
    const modal = new CreateYearPrompt({} as unknown as never, onSubmit);

    modal.onOpen();

    capturedTextOnChange?.('26');

    expect(mockSetDisabled).toHaveBeenLastCalledWith(true);
  });

  it('submits the entered value and closes the modal on valid click', () => {
    const onSubmit = jest.fn();
    const modal = new CreateYearPrompt({} as unknown as never, onSubmit);
    const closeSpy = jest.spyOn(modal, 'close');

    modal.onOpen();
    capturedTextOnChange?.('2026');
    capturedButtonOnClick?.();

    expect(onSubmit).toHaveBeenCalledWith('2026');
    expect(closeSpy).toHaveBeenCalled();
  });

  it('does not submit or close on invalid click', () => {
    const onSubmit = jest.fn();
    const modal = new CreateYearPrompt({} as unknown as never, onSubmit);
    const closeSpy = jest.spyOn(modal, 'close');

    modal.onOpen();
    capturedTextOnChange?.('abc');
    capturedButtonOnClick?.();

    expect(onSubmit).not.toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('empties the content element on close', () => {
    const onSubmit = jest.fn();
    const modal = new CreateYearPrompt({} as unknown as never, onSubmit);

    modal.onClose();

    expect(modal.contentEl.empty).toHaveBeenCalled();
  });
});
