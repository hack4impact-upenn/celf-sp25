import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material';

/**
 * interface for the props of the {@link PaginationTable} component
 * @param columns An {@link Array} of type TColumn
 * @param rows An {@link Array} of type TRow
 */
interface TableProps {
  rows: TRow[];
  columns: TColumn[];
}

interface RowProps {
  row: TRow;
  columns: TColumn[];
}

/**
 * This column interface defines the properties necessary for each column in a table.
 * The align and minWidth props are specific to the MUI Table Cell component.
 * The sortable prop indicates if the column can be sorted.
 */
interface TColumn {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center' | 'justify' | 'inherit';
  sortable?: boolean;
}

/**
 * This row interface defines the properties necessary for each row in a table. Namely, each row object must have a unique key and a properties mapping each column id to a value.
 */
interface TRow {
  key: string;
  [key: string]: any;
}

/**
 * Sorting direction type
 */
type SortDirection = 'asc' | 'desc' | null;

/**
 * Extract text content from a value, handling React elements
 */
const extractTextContent = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  // If it's a React element, try to extract text from props
  if (React.isValidElement(value)) {
    const props = value.props as any;
    const label = props?.label;
    const children = props?.children;
    if (label) return String(label);
    if (children) return String(children);
    return '';
  }
  
  // Convert to string
  return String(value);
};

/**
 * Our pagination table is set up by passing in a row component for each row.
 * This is the row component for a table of users.
 * @param columns - an array of TColumn objects that define the columns of the table.
 * @param row  - a object type containing a unique key for the row and props mapping each column id to a value. If the column id is not present, the corresponding cell will be empty
 * @returns User Row component, to be used in a user-specific pagination table.
 */
function Row({ row, columns }: RowProps) {
  return (
    <TableRow hover role="checkbox" tabIndex={-1} key={`${row.key}TR`}>
      {columns.map((column) => {
        const value = row[column.id];
        if (value === null || value === undefined) {
          return null;
        }
        return (
          <TableCell key={column.id + row.key} align={column.align || 'left'}>
            {value}
          </TableCell>
        );
      })}
    </TableRow>
  );
}

/**
 * A pagination table component, mainly used in tables that require
 * multiple pages, for example the user tables in admin-view. This table will fill 100% of its parent container, so a wrapper should be added if you wish to constrain the table's width and height
 * @param columns - an array of TColumn objects that define the columns of the table. Each column has a display name (the prop is label) and an id prop used to link with the rows array.
 * @param rows - an array of TRow objects that define the rows of the table. They each have props which map column ids to values for that row.
 */
function PaginationTable({ rows, columns }: TableProps) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSort = (columnId: string) => {
    const isAsc = sortColumn === columnId && sortDirection === 'asc';
    const newDirection = isAsc ? 'desc' : 'asc';
    setSortDirection(newDirection);
    setSortColumn(columnId);
    setPage(0);
  };

  // Sort the rows based on current sort state
  const sortedRows = React.useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return rows;
    }

    return [...rows].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      // Extract text content from values
      const aText = extractTextContent(aValue).toLowerCase();
      const bText = extractTextContent(bValue).toLowerCase();

      if (sortDirection === 'asc') {
        return aText.localeCompare(bText);
      } else {
        return bText.localeCompare(aText);
      }
    });
  }, [rows, sortColumn, sortDirection]);

  return (
    <Paper
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TableContainer sx={{ flexGrow: 1, flexShrink: 1 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={sortColumn === column.id ? sortDirection || undefined : undefined}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortColumn === column.id}
                      direction={sortColumn === column.id ? (sortDirection || 'asc') : 'asc'}
                      onClick={() => handleSort(column.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return <Row row={row} key={row.key} columns={columns} />;
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={sortedRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ flexShrink: 0, flexGrow: 0 }}
      />
    </Paper>
  );
}

export { PaginationTable };
export type { TRow, TColumn };
