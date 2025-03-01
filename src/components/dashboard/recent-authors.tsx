import { Avatar } from "../ui/avatar";
import Image from "next/image";

const authors = [
    {
        name: "Minh Thiện",
        email: "minhtaochaphet@gmail.com",
        views: "500,000",
    },
    {
        name: "Hoàng Long",
        email: "hoanglong@gmail.com",
        views: "420,000",
    },
    {
        name: "Thu Hà",
        email: "thuha@gmail.com",
        views: "380,000",
    },
    {
        name: "Văn Nam",
        email: "vannam@gmail.com",
        views: "350,000",
    }
];

export function RecentAuthors() {
    return (
        <div className="space-y-8">
            {authors.map((author, index) => (
                <div key={index} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <Image
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=random`}
                            alt={`${author.name}'s avatar`}
                            width={36}
                            height={36}
                            className="rounded-full object-cover"
                        />
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{author.name}</p>
                        <p className="text-sm text-muted-foreground">{author.email}</p>
                    </div>
                    <div className="ml-auto font-medium">{author.views} views</div>
                </div>
            ))}
        </div>
    );
}