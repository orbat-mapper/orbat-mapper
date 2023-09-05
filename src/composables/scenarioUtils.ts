import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";

export function useActiveScenario() {
  const activeScenario = injectStrict(activeScenarioKey);
  return activeScenario;
}
