import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dispatch, SetStateAction } from 'react'

const TypeFilter = ({
  type,
  setType,
  styles,
}: {
  type: 'image' | 'all' | 'csv' | 'pdf' | 'txt'
  setType: Dispatch<SetStateAction<'image' | 'csv' | 'txt' | 'pdf' | 'all'>>
  styles?: string
}) => {
  return (
    <div
      className={`flex gap-2 items-center flex-col md:flex-row mt-2 ${styles}`}
    >
      <Select
        value={type}
        onValueChange={(newType) => {
          setType(newType as any)
        }}
      >
        <SelectTrigger
          id="type-filter"
          className="w-[180px]"
          defaultValue="all"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="image">Image</SelectItem>
          <SelectItem value="csv">CSV</SelectItem>
          <SelectItem value="pdf">PDF</SelectItem>
          <SelectItem value="txt">Text</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export default TypeFilter
