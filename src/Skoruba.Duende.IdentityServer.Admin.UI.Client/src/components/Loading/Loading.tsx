import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useEffect, useState } from "react";

type LoadingProps = {
  fullscreen?: boolean;
  size?: "sm" | "md" | "lg";
  delayMs?: number;
};

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-4",
  lg: "h-12 w-12 border-4",
};

const spinnerClass =
  "inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] text-muted-foreground motion-reduce:animate-[spin_1.5s_linear_infinite]";

// The fullscreen variant is the one loading screen of the app: the static splash in
// index.html, the Suspense fallback, the session check before the router and the pages
// loading their data all render this markup, so the screen stays the same from the
// first paint until the page shows its content.
const Loading = ({
  fullscreen = false,
  size = "md",
  delayMs = 0,
}: LoadingProps) => {
  const { t } = useTranslation();

  const [show, setShow] = useState(delayMs === 0);

  useEffect(() => {
    if (delayMs === 0) return;

    const timer = setTimeout(() => {
      setShow(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  if (!show) return null;

  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        role="status"
      >
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className={clsx(spinnerClass, sizeMap.sm)} />
          <span>{t("Components.Loading.Loading")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(spinnerClass, sizeMap[size])} role="status">
      <span className="sr-only">{t("Components.Loading.Loading")}</span>
    </div>
  );
};

export default Loading;
