"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { useState, useEffect } from "react"
import React from "react"
import { X } from "lucide-react"

// Define types
interface Chapter {
    title: string;
    content: string;
}

interface NovelFormProps {
    initialData: {
        id: number;
        name: string;
        image: string;
        categories: string[];
        chapters: Chapter[];
        description: string;
        views: number;
        createdAt: string;
    };
    selectedChapter: Chapter | null;
    onChapterChange: (chapter: Chapter) => void;
    onSubmit: (data: any) => void;
}

const formSchema = z.object({
    name: z.string().min(1, { message: "Tên truyện không được để trống." }),
    image: z.string(),
    categories: z.array(z.string()),
    description: z.string().min(1, { message: "Mô tả không được để trống" }),
    chapters: z.array(z.object({
        title: z.string(),
        content: z.string(),
    })),
})

type FormData = z.infer<typeof formSchema>;

const CATEGORIES = [
    "Fantasy", "Adventure", "Romance", "Action", "Comedy", 
    "Drama", "Horror", "Mystery", "Sci-fi", "Slice of Life"
];

export function NovelForm({ initialData, selectedChapter, onChapterChange, onSubmit }: NovelFormProps) {
    const [imagePreview, setImagePreview] = useState(initialData.image)
    const [newCategory, setNewCategory] = useState("")
    
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData,
    })

    useEffect(() => {
        if (selectedChapter) {
            const chapterIndex = initialData.chapters.findIndex(
                ch => ch.title === selectedChapter.title
            );
            if (chapterIndex !== -1) {
                form.setValue(`chapters.${chapterIndex}.content`, selectedChapter.content);
            }
        }
    }, [selectedChapter, form, initialData.chapters]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const result = reader.result as string
                setImagePreview(result)
                form.setValue("image", result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const chapter = initialData.chapters.find(
            ch => ch.title === e.target.value
        );
        if (chapter) {
            onChapterChange(chapter);
        }
    };

    const handleAddCategory = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newCategory.trim() !== '') {
            e.preventDefault();
            const currentCategories = form.getValues('categories');
            if (!currentCategories.includes(newCategory.trim())) {
                form.setValue('categories', [...currentCategories, newCategory.trim()]);
            }
            setNewCategory('');
        }
    };

    const handleRemoveCategory = (categoryToRemove: string) => {
        const currentCategories = form.getValues('categories');
        form.setValue(
            'categories',
            currentCategories.filter(cat => cat !== categoryToRemove)
        );
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Hình ảnh */}
                <div className="space-y-2">
                    <FormLabel>Hình ảnh</FormLabel>
                    <div className="flex items-center gap-4">
                        <div className="relative w-32 h-48 border rounded-md overflow-hidden">
                            <Image
                                src={imagePreview}
                                alt="Novel cover"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="max-w-[250px]"
                        />
                    </div>
                </div>

                {/* Tên truyện */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên Truyện</FormLabel>
                            <FormControl>
                                <Input placeholder="Nhập tên truyện" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Thể loại */}
                <FormField
                    control={form.control}
                    name="categories"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Thể loại</FormLabel>
                            <FormControl>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {field.value.map((category, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                                            >
                                                <span>{category}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCategory(category)}
                                                    className="hover:text-red-500 focus:outline-none"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Thêm thể loại mới..."
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            onKeyDown={handleAddCategory}
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                if (newCategory.trim() !== '') {
                                                    const currentCategories = field.value;
                                                    if (!currentCategories.includes(newCategory.trim())) {
                                                        field.onChange([...currentCategories, newCategory.trim()]);
                                                    }
                                                    setNewCategory('');
                                                }
                                            }}
                                        >
                                            Thêm
                                        </Button>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Nhấn Enter hoặc nút Thêm để thêm thể loại mới
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Mô tả */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mô tả</FormLabel>
                            <FormControl>
                                <Textarea 
                                    placeholder="Nhập mô tả truyện" 
                                    className="resize-none"
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Chọn chương */}
                <FormField
                    control={form.control}
                    name="chapters"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Chương</FormLabel>
                            <FormControl>
                                <select
                                    className="w-full h-10 border rounded-md px-3"
                                    value={selectedChapter?.title || ""}
                                    onChange={handleChapterChange}
                                >
                                    {initialData.chapters.map((chapter, index) => (
                                        <option key={index} value={chapter.title}>
                                            {chapter.title}
                                        </option>
                                    ))}
                                </select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Nội dung chương */}
                {selectedChapter && (
                    <FormField
                        control={form.control}
                        name={`chapters.${initialData.chapters.findIndex(
                            ch => ch.title === selectedChapter.title
                        )}.content`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nội dung chương</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder="Nhập nội dung chương"
                                        className="min-h-[300px] resize-none"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <Button type="submit" className="w-full">
                    Lưu thay đổi
                </Button>
            </form>
        </Form>
    )
}