"use client"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";

export function UserNav() {
    const router = useRouter();
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    className="relative h-8 w-8 rounded-full hover:bg-slate-700 focus-visible:ring-0"
                >
                    <Avatar className="h-8 w-8">
                        <AvatarImage 
                            src="https://github.com/shadcn.png" 
                            alt="@shadcn" 
                        />
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                className="w-56 mt-2" 
                align="end" 
                forceMount
                sideOffset={8}
            >
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">NovelSaga</p>
                        <p className="text-xs text-muted-foreground">
                            novelsaga@gmail.com
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem className="cursor-pointer">
                        Hồ sơ
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                        Cài đặt
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={() => router.push("/login-page")}
                >
                    Đăng xuất
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}