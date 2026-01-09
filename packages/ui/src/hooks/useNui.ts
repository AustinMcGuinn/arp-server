interface NuiCallbackResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Hook for making NUI callbacks to the client
 */
export function useNui() {
  const fetchNui = async <T = unknown>(
    eventName: string,
    data?: Record<string, unknown>
  ): Promise<NuiCallbackResponse<T>> => {
    const resourceName = (window as any).GetParentResourceName?.() ?? "framework";

    try {
      const response = await fetch(`https://${resourceName}/${eventName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(data ?? {}),
      });

      const result = await response.json();
      return result as NuiCallbackResponse<T>;
    } catch (error) {
      console.error(`NUI callback error (${eventName}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const closeNui = () => {
    fetchNui("closeNui");
  };

  return { fetchNui, closeNui };
}
