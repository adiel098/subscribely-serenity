
import { ReactNode } from "react";
import { InitializationProvider } from "./InitializationProvider";
import { TelegramUserProvider } from "./TelegramUserProvider";
import { StartParameterExtractor } from "./StartParameterExtractor";
import { RetryHandler } from "./RetryHandler";
import { LoadingStateManager } from "./LoadingStateManager";
import { ErrorStateManager } from "./ErrorStateManager";

interface AppInitializerProps {
  children: ReactNode;
  startParam: string | null;
  isDevelopmentMode: boolean;
  setIsDevelopmentMode: (isDev: boolean) => void;
  telegramInitialized: boolean;
  setTelegramInitialized: (isInitialized: boolean) => void;
  communityLoading: boolean;
  userLoading: boolean;
  retryCount: number;
  setRetryCount: (count: number) => void;
  setErrorState: (error: string | null) => void;
  isCheckingUserData: boolean;
  setIsCheckingUserData: (isChecking: boolean) => void;
  refetchUser: () => void;
  userError: Error | null;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({
  children,
  startParam,
  isDevelopmentMode,
  setIsDevelopmentMode,
  telegramInitialized,
  setTelegramInitialized,
  communityLoading,
  userLoading,
  retryCount,
  setRetryCount,
  setErrorState,
  isCheckingUserData,
  setIsCheckingUserData,
  refetchUser,
  userError
}) => {
  const handleRetry = () => {
    // This would trigger the RetryHandler
  };

  return (
    <InitializationProvider
      isDevelopmentMode={isDevelopmentMode}
      setIsDevelopmentMode={setIsDevelopmentMode}
      telegramInitialized={telegramInitialized}
      setTelegramInitialized={setTelegramInitialized}
      onRetry={handleRetry}
    >
      <TelegramUserProvider isDevelopmentMode={isDevelopmentMode}>
        <StartParameterExtractor 
          startParam={startParam} 
          isDevelopmentMode={isDevelopmentMode}
        >
          <RetryHandler
            communityLoading={communityLoading}
            userLoading={userLoading}
            retryCount={retryCount}
            setRetryCount={setRetryCount}
            setErrorState={setErrorState}
            setIsCheckingUserData={setIsCheckingUserData}
            refetchUser={refetchUser}
            setTelegramInitialized={setTelegramInitialized}
          />
          <LoadingStateManager
            communityLoading={communityLoading}
            userLoading={userLoading}
            isCheckingUserData={isCheckingUserData}
            setIsCheckingUserData={setIsCheckingUserData}
          />
          <ErrorStateManager
            userError={userError}
            setErrorState={setErrorState}
          />
          {children}
        </StartParameterExtractor>
      </TelegramUserProvider>
    </InitializationProvider>
  );
};
