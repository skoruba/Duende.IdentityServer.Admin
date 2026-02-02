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

const Loading = ({
  fullscreen = false,
  size = "md",
  delayMs = 0,
}: LoadingProps) => {
  const { t } = useTranslation();
  const sizeClass = sizeMap[size];

  const [show, setShow] = useState(delayMs === 0);

  useEffect(() => {
    if (delayMs === 0) return;

    const timer = setTimeout(() => {
      setShow(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  if (!show) return null;

  const spinner = (
    <div
      className={clsx(
        "animate-spin rounded-full border-solid border-current border-r-transparent",
        sizeClass,
        "inline-block align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
      )}
      role="status"
    >
      <span className="sr-only">{t("Components.Loading.Loading")}</span>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Loading;
