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
import { Search, Plus, Trash2, Edit2 } from "lucide-react"
import { AuthorForm } from "@/components/dashboard/author-form"
import { format } from "date-fns"
import { Pagination } from "@/components/ui/pagination"
import * as z from "zod"
import { AuthorRequests } from "@/components/dashboard/author-requests"

// Cập nhật interface
interface Author {
  id: number;
  username: string;
  email: string;
  password: string;
  gender: 'male' | 'female' | 'other';
  level: 'Junior' | 'Senior' | 'Expert';
  experiencePoints: number;
  bio: string;
  createdAt: Date;
  avatar: string;
}

// Định nghĩa formSchema và export để có thể sử dụng
export const formSchema = z.object({
  username: z.string().min(3, { message: "Username phải có ít nhất 3 ký tự" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  gender: z.enum(["male", "female", "other"]),
  level: z.enum(["Junior", "Senior", "Expert"]),
  experiencePoints: z.number().min(0),
  bio: z.string(),
  avatar: z.string()
})

// Định nghĩa type từ schema
export type AuthorFormValues = z.infer<typeof formSchema>;

// Cập nhật dữ liệu mẫu
const initialAuthors: Author[] = [
  { 
    id: 1, 
    username: "sarah_parker",
    email: "sarah.parker@example.com",
    password: "hashedPassword123",
    gender: "female",
    level: "Senior",
    experiencePoints: 2500,
    bio: "Passionate writer with 5 years of experience in fantasy novels.",
    createdAt: new Date("2024-01-15"),
    avatar: "https://ui-avatars.com/api/?name=Sarah+Parker"
  },
  { 
    id: 2, 
    username: "michael_chen",
    email: "michael.chen@example.com",
    password: "hashedPassword123",
    gender: "male",
    level: "Expert",
    experiencePoints: 3500,
    bio: "Expert in financial markets with 10 years of experience.",
    createdAt: new Date("2024-02-01"),
    avatar: "https://ui-avatars.com/api/?name=Michael+Chen"
  },
  { 
    id: 3, 
    username: "emma_wilson",
    email: "emma.wilson@example.com",
    password: "hashedPassword123",
    gender: "female",
    level: "Junior",
    experiencePoints: 1500,
    bio: "Aspiring writer with a passion for science fiction.",
    createdAt: new Date("2024-03-10"),
    avatar: "https://ui-avatars.com/api/?name=Emma+Wilson"
  },
  { 
    id: 4, 
    username: "david_brown",
    email: "david.brown@example.com",
    password: "hashedPassword123",
    gender: "male",
    level: "Expert",
    experiencePoints: 3500,
    bio: "Expert in financial markets with 10 years of experience.",
    createdAt: new Date("2024-01-20"),
    avatar: "https://ui-avatars.com/api/?name=David+Brown"
  },
  { 
    id: 5, 
    username: "lisa_zhang",
    email: "lisa.zhang@example.com",
    password: "hashedPassword123",
    gender: "female",
    level: "Senior",
    experiencePoints: 2500,
    bio: "Passionate writer with 5 years of experience in fantasy novels.",
    createdAt: new Date("2024-02-05"),
    avatar: "https://ui-avatars.com/api/?name=Lisa+Zhang"
  },
  { 
    id: 6, 
    username: "james_wilson",
    email: "james.wilson@example.com",
    password: "hashedPassword123",
    gender: "male",
    level: "Junior",
    experiencePoints: 1500,
    bio: "Aspiring writer with a passion for science fiction.",
    createdAt: new Date("2024-02-10"),
    avatar: "https://ui-avatars.com/api/?name=James+Wilson"
  },
  { 
    id: 7, 
    username: "maria_garcia",
    email: "maria.garcia@example.com",
    password: "hashedPassword123",
    gender: "female",
    level: "Expert",
    experiencePoints: 3500,
    bio: "Expert in financial markets with 10 years of experience.",
    createdAt: new Date("2024-02-15"),
    avatar: "https://ui-avatars.com/api/?name=Maria+Garcia"
  },
  { 
    id: 8, 
    username: "alex_kim",
    email: "alex.kim@example.com",
    password: "hashedPassword123",
    gender: "male",
    level: "Senior",
    experiencePoints: 2500,
    bio: "Passionate writer with 5 years of experience in fantasy novels.",
    createdAt: new Date("2024-02-20"),
    avatar: "https://ui-avatars.com/api/?name=Alex+Kim"
  },
  { 
    id: 9, 
    username: "sophie_martin",
    email: "sophie.martin@example.com",
    password: "hashedPassword123",
    gender: "female",
    level: "Junior",
    experiencePoints: 1500,
    bio: "Aspiring writer with a passion for science fiction.",
    createdAt: new Date("2024-02-25"),
    avatar: "https://ui-avatars.com/api/?name=Sophie+Martin"
  },
  { 
    id: 10, 
    username: "ryan_taylor",
    email: "ryan.taylor@example.com",
    password: "hashedPassword123",
    gender: "male",
    level: "Expert",
    experiencePoints: 3500,
    bio: "Expert in financial markets with 10 years of experience.",
    createdAt: new Date("2024-03-01"),
    avatar: "https://ui-avatars.com/api/?name=Ryan+Taylor"
  },
  { 
    id: 11, 
    username: "emily_davis",
    email: "emily.davis@example.com",
    password: "hashedPassword123",
    gender: "female",
    level: "Senior",
    experiencePoints: 2500,
    bio: "Passionate writer with 5 years of experience in fantasy novels.",
    createdAt: new Date("2024-03-05"),
    avatar: "https://ui-avatars.com/api/?name=Emily+Davis"
  },
  { 
    id: 12, 
    username: "daniel_lee",
    email: "daniel.lee@example.com",
    password: "hashedPassword123",
    gender: "male",
    level: "Junior",
    experiencePoints: 1500,
    bio: "Aspiring writer with a passion for science fiction.",
    createdAt: new Date("2024-03-15"),
    avatar: "https://ui-avatars.com/api/?name=Daniel+Lee"
  }
]

export default function AuthorsPage() {
  const [authors, setAuthors] = useState(initialAuthors)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [editingAuthor, setEditingAuthor] = useState<typeof initialAuthors[0] | null>(null)
  const ITEMS_PER_PAGE = 10

  const filteredAuthors = authors.filter((author) =>
    author.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    author.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredAuthors.length / ITEMS_PER_PAGE)
  const paginatedAuthors = filteredAuthors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleDelete = (id: number) => {
    setAuthors(authors.filter((author) => author.id !== id))
  }

  const handleSubmit = (data: AuthorFormValues, isEdit: boolean = false) => {
    if (isEdit && editingAuthor) {
      setAuthors(authors.map((author) =>
        author.id === editingAuthor.id
          ? { ...author, ...data }
          : author
      ))
      setEditingAuthor(null)
    } else {
      const newAuthor: Author = {
        id: authors.length + 1,
        ...data,
        createdAt: new Date()
      }
      setAuthors([...authors, newAuthor])
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Authors</h2>
        <div className="flex items-center gap-4">
          <AuthorRequests />
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Author
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Author</DialogTitle>
              </DialogHeader>
              <AuthorForm onSubmit={(data) => handleSubmit(data)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search authors..."
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
                <TableHead>Email</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAuthors.map((author) => (
                <TableRow key={author.id}>
                  <TableCell>{author.id}</TableCell>
                  <TableCell className="font-medium">{author.username}</TableCell>
                  <TableCell>{author.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${author.level === "Expert" ? "bg-green-100 text-green-800" :
                        author.level === "Senior" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"}`}>
                      {author.level}
                    </span>
                  </TableCell>
                  <TableCell>{format(author.createdAt, "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => setEditingAuthor(author)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Author</DialogTitle>
                          </DialogHeader>
                          <AuthorForm
                            onSubmit={(data) => handleSubmit(data)}
                            defaultValues={editingAuthor || undefined}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(author.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedAuthors.length < ITEMS_PER_PAGE && (
                Array(ITEMS_PER_PAGE - paginatedAuthors.length).fill(0).map((_, index) => (
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
    </div>
  )
}