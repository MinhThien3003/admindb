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
import { UserForm } from "@/components/dashboard/user-form"
import { format } from "date-fns"
import { Pagination } from "@/components/ui/pagination"

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  fullName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  phoneNumber?: string;
  address?: string;
  avatar: string;
  status: 'active' | 'inactive' | 'banned';
  bio?: string;
  createdAt: Date;
}

const initialUsers: User[] = [
  {
    id: 1,
    username: "john_doe",
    email: "john.doe@example.com",
    password: "hashedPassword123",
    fullName: "John Doe",
    gender: "male",
    dateOfBirth: "1990-01-15",
    phoneNumber: "0123456789",
    address: "123 Main St, City",
    avatar: "https://ui-avatars.com/api/?name=John+Doe",
    status: "active",
    bio: "Regular user who loves reading novels",
    createdAt: new Date("2024-01-01")
  },
  {
    id: 2,
    username: "jane_smith",
    email: "jane.smith@example.com",
    password: "hashedPassword123",
    fullName: "Jane Smith",
    gender: "female",
    dateOfBirth: "1992-05-20",
    phoneNumber: "0987654321",
    address: "456 Oak St, Town",
    avatar: "https://ui-avatars.com/api/?name=Jane+Smith",
    status: "active",
    bio: "Avid reader and book reviewer",
    createdAt: new Date("2024-01-15")
  },
  {
    id: 3,
    username: "mike_wilson",
    email: "mike.wilson@example.com",
    password: "hashedPassword123",
    fullName: "Mike Wilson",
    gender: "male",
    dateOfBirth: "1988-08-10",
    phoneNumber: "0123498765",
    address: "789 Pine St, Village",
    avatar: "https://ui-avatars.com/api/?name=Mike+Wilson",
    status: "inactive",
    bio: "Casual reader",
    createdAt: new Date("2024-02-01")
  },
  // Thêm nhiều users mẫu khác...
]

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const ITEMS_PER_PAGE = 10

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleDelete = (id: number) => {
    setUsers(users.filter((user) => user.id !== id))
  }

  const handleSubmit = (data: any, isEdit: boolean = false) => {
    if (isEdit && editingUser) {
      setUsers(users.map((user) =>
        user.id === editingUser.id
          ? { ...user, ...data }
          : user
      ))
      setEditingUser(null)
    } else {
      const newUser = {
        ...data,
        id: users.length + 1,
        createdAt: new Date(),
      }
      setUsers([...users, newUser])
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <UserForm onSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
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
                <TableHead>Avatar</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-8 h-8 rounded-full"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${user.status === "active" ? "bg-green-100 text-green-800" :
                        user.status === "inactive" ? "bg-gray-100 text-gray-800" :
                        "bg-red-100 text-red-800"}`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>{format(user.createdAt, "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                          </DialogHeader>
                          <UserForm
                            onSubmit={(data) => handleSubmit(data, true)}
                            defaultValues={editingUser}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedUsers.length < ITEMS_PER_PAGE && (
                Array(ITEMS_PER_PAGE - paginatedUsers.length).fill(0).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    <TableCell colSpan={8}>&nbsp;</TableCell>
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