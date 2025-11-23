"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Card, Flex, Table, Text, TextField } from "@radix-ui/themes";
import { CaretUpIcon, CaretDownIcon, CaretSortIcon } from "@radix-ui/react-icons";
import type { ReactNode } from "react";

type Column<T> = {
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: "center" | "right" | "left" | "justify" | "char" | undefined;
  /** 並び替え用の値取得（未指定ならソート不可） */
  sortValue?: (row: T) => string | number | Date;
};

type ContentsTableProps<T> = {
  /** テーブル上部のタイトル */
  title?: ReactNode;
  /** タイトル下の説明文 */
  description?: ReactNode;
  /** 右上アクションボタン群 */
  actions?: ReactNode;
  /** カラム定義 */
  columns: Array<Column<T>>;
  /** 全件の行データ（一覧で必要な軽い情報を想定） */
  rows: T[];
  /** 行キー生成（省略時はindex） */
  getRowKey?: (row: T, index: number) => string | number;
  /** 1ページあたりの表示件数（省略時は10件） */
  rowsPerPage?: number;
  /** 初期表示ページ（1始まり、デフォルト1） */
  initialPage?: number;
  /** ページ変更時のフック（外部で副作用を走らせたい場合に使用） */
  onPageChange?: (page: number) => void;
  /** フィルターの有効・無効（デフォルト有効） */
  enableFilter?: boolean;
  /** フィルター用プレースホルダー */
  filterPlaceholder?: string;
  /** カスタムフィルター判定（trueで残す） */
  filterFn?: (row: T, keyword: string) => boolean;
};

type SortState = { columnIndex: number; direction: "asc" | "desc" } | null;

export function ContentsTable<T>({
  title,
  description,
  actions,
  columns,
  rows,
  getRowKey,
  rowsPerPage = 10,
  initialPage = 1,
  onPageChange,
  enableFilter = true,
  filterPlaceholder = "キーワードでフィルター",
  filterFn,
}: ContentsTableProps<T>) {
  const [page, setPage] = useState(initialPage);
  const [keyword, setKeyword] = useState("");
  const [sortState, setSortState] = useState<SortState>(null);

  const filterPredicate = useCallback((row: T, term: string) => {
    if (filterFn) return filterFn(row, term);
    const text = Object.values(row as Record<string, unknown>)
      .map((v) => String(v ?? ""))
      .join(" ")
      .toLowerCase();
    return text.includes(term.toLowerCase());
  }, [filterFn]);

  const filteredRows = useMemo(() => {
    const term = keyword.trim();
    if (!enableFilter || term === "") return rows;
    return rows.filter((row) => filterPredicate(row, term));
  }, [rows, keyword, enableFilter, filterPredicate]);

  const sortedRows = useMemo(() => {
    if (!sortState) return filteredRows;
    const col = columns[sortState.columnIndex];
    if (!col?.sortValue) return filteredRows;
    const dir = sortState.direction === "asc" ? 1 : -1;
    return [...filteredRows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av === bv) return 0;
      if (av === undefined || av === null) return 1;
      if (bv === undefined || bv === null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      const aStr = String(av).toLowerCase();
      const bStr = String(bv).toLowerCase();
      return aStr > bStr ? dir : -dir;
    });
  }, [filteredRows, columns, sortState]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(sortedRows.length / rowsPerPage)),
    [sortedRows.length, rowsPerPage],
  );

  useEffect(() => {
    // データ変更で総ページが減った場合は末尾に合わせる
    if (page > totalPages) {
      setPage(totalPages);
      onPageChange?.(totalPages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage, rows.length]);

  const start = (page - 1) * rowsPerPage;
  const currentRows = sortedRows.slice(start, start + rowsPerPage);

  const handlePrev = () => {
    setPage((prev) => {
      const next = Math.max(1, prev - 1);
      onPageChange?.(next);
      return next;
    });
  };

  const handleNext = () => {
    setPage((prev) => {
      const next = Math.min(totalPages, prev + 1);
      onPageChange?.(next);
      return next;
    });
  };

  const toggleSort = (index: number) => {
    setSortState((prev) => {
      if (!prev || prev.columnIndex !== index) return { columnIndex: index, direction: "asc" };
      if (prev.direction === "asc") return { columnIndex: index, direction: "desc" };
      return null; // descの次はデフォルト順に戻す
    });
  };

  return (
    <Card variant="classic" className="w-full">
      {(title || description || actions || enableFilter) && (
        <Flex
          justify="between"
          align={{ initial: "start", md: "center" }}
          direction={{ initial: "column", md: "row" }}
          gap="4"
          mb="4"
        >
          <Box className="w-full">
            {title && (
              <Text as="div" size="4" weight="bold">
                {title}
              </Text>
            )}
            {description && (
              <Text size="2" color="gray">
                {description}
              </Text>
            )}
            {enableFilter && (
              <TextField.Root
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={filterPlaceholder}
                className="w-[240px] mt-2"
                size="2"
              />
            )}
          </Box>
          {actions && <Flex gap="2" wrap="wrap">{actions}</Flex>}
        </Flex>
      )}

      <Table.Root>
        <Table.Header>
          <Table.Row>
            {columns.map((col, idx) => {
              const isSortable = typeof col.sortValue === "function";
              const isActive = sortState?.columnIndex === idx;
              const direction = sortState?.direction;
              return (
                <Table.ColumnHeaderCell key={idx}>
                  <Flex align="center" justify="between" gap="2">
                    <span>{col.header}</span>
                    {isSortable && (
                      <Button
                        size="1"
                        variant={isActive ? "solid" : "ghost"}
                        onClick={() => toggleSort(idx)}
                        aria-label="並び替え"
                        radius="full"
                      >
                        {direction === "asc" ? <CaretUpIcon/> : direction === "desc" ? <CaretDownIcon/> : <CaretSortIcon/>}
                      </Button>
                    )}
                  </Flex>
                </Table.ColumnHeaderCell>
              );
            })}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {currentRows.map((row, rowIndex) => (
            <Table.Row key={getRowKey ? getRowKey(row, start + rowIndex) : start + rowIndex}>
              {columns.map((col, colIndex) => (
                <Table.Cell key={colIndex} align={col.align ?? "left"}>
                  {col.cell(row)}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
          {currentRows.length === 0 && (
            <Table.Row>
              <Table.Cell colSpan={columns.length}>
                <Text size="2" color="gray">
                  データがありません。
                </Text>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>

      <Flex mt="4" justify="between" align="center" wrap="wrap" gap="3">
        <Text size="2" color="gray">
          ページ {page} / {totalPages}
        </Text>
        <Flex gap="2">
          <Button variant="soft" radius="full" disabled={page <= 1} onClick={handlePrev}>
            前へ
          </Button>
          <Button radius="full" disabled={page >= totalPages} onClick={handleNext}>
            次へ
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
