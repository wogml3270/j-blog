declare module "@toast-ui/editor" {
  type EditorOptions = {
    el: HTMLElement;
    initialValue?: string;
    initialEditType?: "markdown" | "wysiwyg";
    previewStyle?: "vertical" | "tab";
    autofocus?: boolean;
    hideModeSwitch?: boolean;
    usageStatistics?: boolean;
    placeholder?: string;
    height?: string;
    events?: {
      change?: () => void;
    };
  };

  export class Editor {
    constructor(options: EditorOptions);
    getMarkdown(): string;
    setMarkdown(value: string, cursorToEnd?: boolean): void;
    destroy(): void;
  }
}

declare module "@toast-ui/editor/viewer" {
  type ViewerOptions = {
    el: HTMLElement;
    initialValue?: string;
    usageStatistics?: boolean;
  };

  class ToastViewer {
    constructor(options: ViewerOptions);
    setMarkdown(markdown: string): void;
    destroy(): void;
  }

  export default ToastViewer;
}
