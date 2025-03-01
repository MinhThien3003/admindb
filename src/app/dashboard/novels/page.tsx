"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Trash2, Plus, Edit2 } from "lucide-react"
import { NovelForm } from "@/components/dashboard/novel-form"
import { Pagination } from "@/components/ui/pagination"

// Temporary data - replace with actual data fetching
const initialNovels: Novel[] = [
  { 
    id: 1, 
    name: "The Lost Kingdom", 
    image: "/images/novels/lost-kingdom.jpg",
    categories: ["Fantasy", "Adventure"],
    chapters: [
      { title: "Chapter 1", content: "Content of Chapter 1" }, 
      { title: "Chapter 2", content: "Content of Chapter 2" }
    ], 
    views: 12500, 
    createdAt: "2022-01-01", 
    description: "An epic tale of adventure." 
  },
  { 
    id: 2, 
    name: "Eternal Flame", 
    image: "/images/novels/eternal-flame.jpg",
    categories: ["Romance", "Drama"],
    chapters: [
      { title: "Chapter 1", content: "Content of Chapter 1" }
    ], 
    views: 8900, 
    createdAt: "2022-02-15", 
    description: "A story of love and sacrifice." 
  },
  { 
    id: 3, 
    name: "Shadow Walker", 
    image: "/novels/shadow-walker.jpg",
    categories: ["Mystery", "Horror"],
    chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }],
    views: 7800, 
    createdAt: "2022-03-01", 
    description: "A supernatural mystery." 
  },
  { 
    id: 4, 
    name: "Digital Dreams", 
    image: "/novels/digital-dreams.jpg",
    categories: ["Sci-fi", "Adventure"],
    chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }],
    views: 9200, 
    createdAt: "2022-03-15", 
    description: "A cyberpunk adventure." 
  },
  { 
    id: 5, 
    name: "Heart's Echo", 
    image: "/novels/hearts-echo.jpg",
    categories: ["Romance", "Drama"],
    chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }],
    views: 11300, 
    createdAt: "2022-04-01", 
    description: "A touching love story." 
  },
  { 
    id: 6, 
    name: "Dragon's Call", 
    image: "/novels/dragons-call.jpg",
    categories: ["Fantasy", "Action"],
    chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }],
    views: 13400, 
    createdAt: "2022-04-15", 
    description: "A dragon tamer's journey." 
  },
  { 
    id: 7, 
    name: "Urban Legends", 
    image: "/novels/urban-legends.jpg",
    categories: ["Horror", "Mystery"],
    chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }],
    views: 8700, 
    createdAt: "2022-05-01", 
    description: "Modern horror stories." 
  },
  { 
    id: 8, 
    name: "Time Travelers", 
    image: "/novels/time-travelers.jpg",
    categories: ["Sci-fi", "Adventure"],
    chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }],
    views: 10200, 
    createdAt: "2022-05-15", 
    description: "A journey through time." 
  },
  { 
    id: 9, 
    name: "School Days", 
    image: "/novels/school-days.jpg",
    categories: ["Slice of Life", "Comedy"],
    chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }],
    views: 9500, 
    createdAt: "2022-06-01", 
    description: "Hilarious school adventures." 
  },
  { 
    id: 10, 
    name: "Warrior's Path", 
    image: "/novels/warriors-path.jpg",
    categories: ["Action", "Fantasy"],
    chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }],
    views: 14200, 
    createdAt: "2022-06-15", 
    description: "A martial arts epic." 
  },
  { 
    id: 11, 
    name: "Ocean's Heart", 
    image: "/novels/oceans-heart.jpg",
    categories: ["Adventure", "Romance"],
    chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }],
    views: 12100, 
    createdAt: "2022-07-01", 
    description: "A seafaring romance." 
  },
  { 
    id: 12, 
    name: "Night Watch", 
    image: "/novels/night-watch.jpg",
    categories: ["Mystery", "Action"],
    chapters: [{ title: "Chapter 1", content: "Content of Chapter 1" }],
    views: 11800, 
    createdAt: "2022-07-15", 
    description: "A detective's story." 
  }
]

// Định nghĩa interface cho Novel
interface Novel {
  id: number;
  name: string;
  image: string;
  categories: string[];
  chapters: Array<{
    title: string;
    content: string;
  }>;
  views: number;
  createdAt: string;
  description: string;
}

export default function NovelsPage() {
  const [novels, setNovels] = useState<Novel[]>(initialNovels)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<{title: string, content: string} | null>(null)

  const filteredNovels = novels.filter((novel) =>
    novel.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredNovels.length / ITEMS_PER_PAGE)
  const paginatedNovels = filteredNovels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleDelete = (id: number) => {
    setNovels(novels.filter((novel) => novel.id !== id))
  }

  const handleEdit = (novel: Novel) => {
    setSelectedNovel(novel)
    setSelectedChapter(novel.chapters[0])
  }

  const handleClose = () => {
    setSelectedNovel(null)
    setSelectedChapter(null)
  }

  const handleSubmit = (data: Partial<Novel>, isEdit: boolean = false) => {
    if (isEdit && selectedNovel) {
      setNovels(novels.map((novel) => 
        novel.id === selectedNovel.id ? { ...novel, ...data } : novel
      ));
      handleClose();
    } else {
      // Thêm novel mới
      const newNovel: Novel = {
        id: novels.length + 1,
        name: data.name || "",
        image: data.image || "",
        categories: data.categories || [],
        chapters: data.chapters || [{ title: "Chapter 1", content: "" }],
        views: 0,
        createdAt: new Date().toISOString(),
        description: data.description || ""
      };
      setNovels([...novels, newNovel]);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Novels</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Novel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Novel</DialogTitle>
            </DialogHeader>
            <NovelForm
              initialData={{
                id: novels.length + 1,
                name: "",
                image: "",
                categories: [],
                chapters: [{ title: "Chapter 1", content: "" }],
                views: 0,
                createdAt: new Date().toISOString(),
                description: ""
              }}
              selectedChapter={{ title: "Chapter 1", content: "" }}
              onChapterChange={() => {}}
              onSubmit={(data) => handleSubmit(data)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search novels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="min-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Chapters</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedNovels.map((novel) => (
                <TableRow key={novel.id}>
                  <TableCell>{novel.id}</TableCell>
                  <TableCell className="font-medium">{novel.name}</TableCell>
                  <TableCell>{novel.chapters.length}</TableCell>
                  <TableCell>{novel.views.toLocaleString()}</TableCell>
                  <TableCell>{novel.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(novel)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(novel.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedNovels.length < ITEMS_PER_PAGE && (
                Array(ITEMS_PER_PAGE - paginatedNovels.length).fill(0).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    <TableCell colSpan={6}>&nbsp;</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="border-t">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Dialog for editing novel */}
      <Dialog open={!!selectedNovel} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Truyện</DialogTitle>
          </DialogHeader>
          {selectedNovel && (
            <NovelForm
              initialData={selectedNovel}
              selectedChapter={selectedChapter}
              onChapterChange={setSelectedChapter}
              onSubmit={(data: Partial<Novel>) => {
                setNovels(novels.map((novel) => 
                  novel.id === selectedNovel.id ? { ...novel, ...data } : novel
                ));
                handleClose();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}