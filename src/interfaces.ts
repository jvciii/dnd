export interface DragItem {
  index: number;
  parentId: string;
  id: string;
  type: string;
  text: string;
  isTemp: boolean;
  tempParentId?: string;
  originalIndex?: number | undefined;
}

export interface Item {
  parentId: string;
  id: string;
  originalIndex?: number;
  text: string;
  isTemp?: boolean;
  tempParentId?: string;
}
