import { DemoFlow } from "@/components/demo/demo-flow";
import { demoData } from "@/lib/demo/demo-data";

export default function DemoPage() {
  return <DemoFlow data={demoData} />;
}
