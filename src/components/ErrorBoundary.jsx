import React from "react";

// Without a boundary, React unmounts the entire tree when any component throws
// during render — so one bad number in a chart tooltip took the whole dashboard
// to a black page. This keeps the failure where it happened and leaves the rest
// of the app usable.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Still surfaced for anyone with the console open; the UI no longer
    // depends on someone noticing it.
    console.error(`[${this.props.label || "view"}] render failed:`, error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    // A new view (or a new data key) gets a clean slate, so a crash in one
    // section does not persist after navigating away and back.
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="error-boundary">
        <h3>{this.props.title || "This section could not be displayed"}</h3>
        <p>
          Something in this view failed to render. The rest of the dashboard is unaffected — switch
          sections, or reload to try again.
        </p>
        <pre>{String(this.state.error?.message || this.state.error)}</pre>
        <button type="button" className="ghost" onClick={() => this.setState({ error: null })}>
          Try again
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
