import { FileBrowser } from '../_components/file-browser'

export default function FavoritesPage() {
  return (
    <div>
      <FileBrowser title="Trash Can" deleteOnly />
    </div>
  )
}
