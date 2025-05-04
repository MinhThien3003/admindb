"use client";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({
    username: z.string().min(1, {
        message: "Vui lòng nhập tên đăng nhập",
    }),
    password: z.string().min(1, {
        message: "Vui lòng nhập mật khẩu.",
    }),
})

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading } = useAuth();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>){
        try {
            console.log("Đăng nhập với:", values);
            
            // Sử dụng hook useAuth để đăng nhập
            const success = await login(values.username, values.password);
            
            if (success) {
                console.log("Bắt đầu chuyển hướng đến /dashboard");
                router.push("/dashboard");
                console.log("Đã gọi router.push('/dashboard')");
            }
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
        }
    }

    return (
        <div className="h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/login/bg.jpg"
                    alt="Background"
                    fill
                    priority
                    quality={90}
                    style={{
                        objectFit: 'cover',
                    }}
                />
                <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Login Form */}
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg z-10 animate-fadeIn">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">Novel Saga</h1>
                    <p className="text-gray-600">Chào Mừng Đến Với Admin DashBoard</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tài khoản</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập tên đăng nhập" {...field} />
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