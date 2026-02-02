import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import i18next from "@/i18n/config";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call the optional error handler
    this.props.onError?.(error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="w-full max-w-lg space-y-4">
            <Alert className="border-red-200 dark:border-red-800">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-1" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">
                    {String(i18next.t("Components.ErrorBoundary.Title"))}
                  </h3>
                  <AlertDescription>
                    {String(i18next.t("Components.ErrorBoundary.Description"))}
                  </AlertDescription>

                  {process.env.NODE_ENV === "development" &&
                    this.state.error && (
                      <details className="mt-4 rounded-md bg-gray-50 dark:bg-gray-800 p-3">
                        <summary className="cursor-pointer font-medium text-sm text-gray-700 dark:text-gray-300">
                          {String(i18next.t("Components.ErrorBoundary.Details"))}
                        </summary>
                        <pre className="mt-2 text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap overflow-auto">
                          {this.state.error.message}
                          {this.state.errorInfo?.componentStack && (
                            <>
                              {"\n\nComponent Stack:"}
                              {this.state.errorInfo.componentStack}
                            </>
                          )}
                        </pre>
                      </details>
                    )}

                  <div className="flex gap-3 mt-4">
                    <Button
                      onClick={this.handleReset}
                      variant="outline"
                      className="flex-1"
                    >
                      {String(i18next.t("Components.ErrorBoundary.TryAgain"))}
                    </Button>
                    <Button onClick={this.handleReload} className="flex-1">
                      {String(i18next.t("Components.ErrorBoundary.ReloadPage"))}
                    </Button>
                  </div>
                </div>
              </div>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
