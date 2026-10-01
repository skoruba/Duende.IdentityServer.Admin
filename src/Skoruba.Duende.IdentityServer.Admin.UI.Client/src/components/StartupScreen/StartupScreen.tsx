type StartupScreenProps = {
  message?: string;
};

const StartupScreen = ({ message }: StartupScreenProps) => (
  <div
    className="min-h-screen flex items-center justify-center"
    role="status"
    aria-live="polite"
  >
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      {message ? <span>{message}</span> : null}
    </div>
  </div>
);

export default StartupScreen;
