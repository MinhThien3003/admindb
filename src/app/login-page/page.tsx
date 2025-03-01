"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import Image from "next/image";

const formSchema = z.object({
    email: z.string().email({
        message: "Nhập đúng địa chỉ email!",
    }),
    password: z.string().max(6, {
        message:"Nhập tối đa 6 ký tự.",
    }),
})

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>){
        try{
            setIsLoading(true)
            console.log(values) // Thêm log để sử dụng values
            toast.success("Đăng nhập thành công!")
            router.push("/dashboard")
        } catch (error: unknown) {
            toast.error("Thông tin đăng nhập không hợp lệ!")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    // Thêm log để kiểm tra đường dẫn
    console.log("Image path N:", "/images/login/char N.png")
    console.log("Image path S:", "/images/login/char S.png")

    return (
        <div className="h-screen flex items-center justify-center bg-slate-600 relative overflow-hidden">
            {/* Character N */}
            <div className="absolute left-[5%] top-1/2 -translate-y-1/2 hidden lg:block animate-slideDown">
                <Image
                    src="/images/login/char N.png"
                    alt="Character N"
                    width={400}
                    height={600}
                    priority
                    quality={75}
                    style={{
                        objectFit: 'contain',
                        width: '400px',
                        height: '600px',
                        filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.1))',
                        transform: 'translateZ(0)'  // Tối ưu performance
                    }}
                />
            </div>

            {/* Character S */}
            <div className="absolute right-[5%] top-1/2 -translate-y-1/2 hidden lg:block animate-slideDown">
                <Image
                    src="/images/login/char S.png"
                    alt="Character S"
                    width={400}
                    height={600}
                    priority
                    quality={75}
                    style={{
                        objectFit: 'contain',
                        width: '400px',
                        height: '600px',
                        filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.1))',
                        transform: 'translateZ(0)'  // Tối ưu performance
                    }}
                />
            </div>

            {/* Login Form */}
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg z-10 animate-slideDown">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">Novel Saga</h1>
                    <p className="text-gray-600">Chào Mừng Đến Với Admin DashBoard</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tài khoản</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập tài khoản" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mật khẩu</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Nhập mật khẩu" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Đang đăng nhập ..." : "Đăng nhập"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}