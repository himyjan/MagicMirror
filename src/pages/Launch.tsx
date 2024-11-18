import banner from "@/assets/images/magic-mirror.svg";
import { ProgressBar } from "@/components/ProgressBar";
import { useDownload } from "@/hooks/useDownload";
import { useServer } from "@/hooks/useServer";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export function LaunchPage() {
  const { t } = useTranslation();
  const { progress, download, status: downloadStatus } = useDownload();
  const { launch, status: launchingStatus } = useServer();

  const launchingStatusRef = useRef(launchingStatus);
  launchingStatusRef.current = launchingStatus;

  useEffect(() => {
    download();
  }, []);

  useEffect(() => {
    if (downloadStatus === "success") {
      launch();
      Promise.all([
        new Promise((resolve) => {
          setTimeout(resolve, 3000);
        }),
        new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (launchingStatusRef.current === "running") {
              clearInterval(checkInterval);
              resolve(true);
            }
          }, 100);
        }),
      ]).then(() => {
        // todo jump to home page
        console.log(">>> Launched");
      });
    }
  }, [downloadStatus]);

  const launching = ["launching", "running"].includes(launchingStatus) ? (
    <>
      <p>{t("Starting... First load may take longer, please be patient.")}</p>
    </>
  ) : null;

  const downloading = ["downloading", "unzipping", "failed"].includes(
    downloadStatus
  ) ? (
    <>
      <p>{t("Downloading resources, please wait", { progress })}</p>
      <ProgressBar progress={progress} />
      <p className="c-[rgba(255,255,255,0.6)] text-12px">
        {t(
          "*If the download is stuck or fails, please download and initialize manually. "
        )}
        <span className="c-blue cursor-pointer">{t("View tutorial")}</span>
      </p>
    </>
  ) : null;

  return (
    <div
      data-tauri-drag-region
      className="w-100vw h-100vh bg-black color-white flex-col-c-c gap-8px p-10px"
    >
      <img
        src={banner}
        className="w-80% object-cover cursor-default pointer-events-none"
      />
      {launching}
      {downloading}
    </div>
  );
}