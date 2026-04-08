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
