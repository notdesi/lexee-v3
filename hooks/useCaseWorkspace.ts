"use client";

import { useEffect, useState } from "react";
import {
  CASE_WORKSPACE_EVENT,
  getCaseWorkspaceState,
  type CaseWorkspaceState,
} from "@/lib/case-workspace";

export function useCaseWorkspace(): CaseWorkspaceState {
  const [state, setState] = useState<CaseWorkspaceState>(() => getCaseWorkspaceState());

  useEffect(() => {
    const onWorkspaceChanged = (event: Event) => {
      const next =
        (event as CustomEvent<{ state?: CaseWorkspaceState }>).detail?.state ??
        getCaseWorkspaceState();
      setState(next);
    };
    window.addEventListener(CASE_WORKSPACE_EVENT, onWorkspaceChanged);
    return () => window.removeEventListener(CASE_WORKSPACE_EVENT, onWorkspaceChanged);
  }, []);

  return state;
}
