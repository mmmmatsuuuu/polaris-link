import { Flex, Box } from "@radix-ui/themes";
import type { ReactNode } from "react";

type MasterDetailProps = {
  masterHeader: ReactNode;
  master: ReactNode;
  detailHeader: ReactNode;
  detail: ReactNode;
  gap?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
  className?: string;
};

/**
 * 左:マスター（一覧）、右:詳細 の2カラムレイアウト。デフォルトで右:左 = 2:1。
 */
export function MasterDetail({ masterHeader, master,detailHeader, detail, gap = "4", className }: MasterDetailProps) {
  return (
    <Flex gap={gap} className={className} wrap="nowrap">
      <Box flexShrink="0" className="w-full md:w-1/3 overflow-y-hidden">
        <div>
          { masterHeader }
        </div>
        <div className="w-full h-full overflow-y-scroll p-0">
          {master}
        </div>
      </Box>
      <Box flexGrow="1" className="w-full md:w-2/3">
        <div>
          { detailHeader }
        </div>
        <div className="w-full h-full overflow-y-scroll p-0">
          {detail}
        </div>
      </Box>
    </Flex>
  );
}
