import { loadDemandRunIndex as loadDemandRunIndexFromStore } from "@/lib/demand-intelligence/storage";

export async function loadDemandRunIndex() {
  return loadDemandRunIndexFromStore();
}