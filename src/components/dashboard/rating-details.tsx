"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, StarHalf } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"

// Định nghĩa interface cho Rating
interface Rating {
  userId: number
  username: string
  stars: number
  comment?: string
  createdAt: string
}

// Định nghĩa interface cho Chapter
interface Chapter {
  title: string
  content: string
  price?: number
  isPremium?: boolean
  ratings?: Rating[]
}

// Định nghĩa interface cho Novel
interface Novel {
  id: number
  name: string
  image: string
  categories: string[]
  chapters: Chapter[]
  views: number
  createdAt: string
  description: string
  averageRating?: number
  totalRatings?: number
}

interface RatingDetailsProps {
  novel: Novel
}

// Hàm tính điểm trung bình của một chương
const calculateChapterRating = (ratings: Rating[] = []) => {
  if (ratings.length === 0) return 0;
  const totalStars = ratings.reduce((sum, rating) => sum + rating.stars, 0);
  return parseFloat((totalStars / ratings.length).toFixed(1));
};

// Hàm chuyển đổi số sao sang điểm (5 sao = 10 điểm)
const starsToPoints = (stars: number) => {
  return (stars / 5) * 10;
};

// Hàm tạo mảng sao dựa trên điểm đánh giá
const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
  }

  if (hasHalfStar) {
    stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
  }

  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
  }

  return stars;
};

export function RatingDetails({ novel }: RatingDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Tính toán số lượng đánh giá cho mỗi mức sao
  const calculateRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRatings = 0;

    novel.chapters.forEach(chapter => {
      if (chapter.ratings) {
        chapter.ratings.forEach(rating => {
          distribution[rating.stars as keyof typeof distribution]++;
          totalRatings++;
        });
      }
    });

    return { distribution, totalRatings };
  };

  const { distribution, totalRatings } = calculateRatingDistribution();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Tổng quan</TabsTrigger>
        <TabsTrigger value="chapters">Theo chương</TabsTrigger>
        <TabsTrigger value="users">Theo người dùng</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Thống kê đánh giá</CardTitle>
            <CardDescription>
              Tổng hợp đánh giá của truyện "{novel.name}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-4xl font-bold">{novel.averageRating || 0}</div>
              <div className="flex items-center">
                {renderStars(novel.averageRating || 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                ({totalRatings} đánh giá)
              </div>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(stars => (
                <div key={stars} className="flex items-center space-x-2">
                  <div className="w-10 text-sm">{stars} sao</div>
                  <Progress 
                    value={totalRatings ? (distribution[stars] / totalRatings) * 100 : 0} 
                    className="h-2" 
                  />
                  <div className="w-10 text-sm text-right">
                    {distribution[stars]}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-2">Điểm quy đổi</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-md">
                  <div className="text-sm text-muted-foreground">Điểm trung bình</div>
                  <div className="text-2xl font-bold">
                    {starsToPoints(novel.averageRating || 0).toFixed(1)}/10
                  </div>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <div className="text-sm text-muted-foreground">Tổng số đánh giá</div>
                  <div className="text-2xl font-bold">{totalRatings}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="chapters" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Đánh giá theo chương</CardTitle>
            <CardDescription>
              Chi tiết đánh giá của từng chương trong truyện
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {novel.chapters.map((chapter, index) => {
                  const chapterRating = calculateChapterRating(chapter.ratings);
                  const ratingCount = chapter.ratings?.length || 0;
                  
                  return (
                    <div key={index} className="pb-4 border-b last:border-0">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{chapter.title}</h3>
                        <div className="flex items-center">
                          <span className="mr-2">{chapterRating}</span>
                          <div className="flex">
                            {renderStars(chapterRating)}
                          </div>
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({ratingCount} đánh giá)
                          </span>
                        </div>
                      </div>
                      
                      {chapter.ratings && chapter.ratings.length > 0 ? (
                        <div className="space-y-2 mt-2">
                          {chapter.ratings.map((rating, rIndex) => (
                            <div key={rIndex} className="bg-muted p-2 rounded-md">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <Avatar className="h-6 w-6 mr-2">
                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${rating.username}`} />
                                    <AvatarFallback>{rating.username.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium">{rating.username}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="mr-1">{rating.stars}</span>
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                </div>
                              </div>
                              {rating.comment && (
                                <p className="text-sm mt-1 pl-8">{rating.comment}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Chưa có đánh giá nào cho chương này</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="users" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Đánh giá theo người dùng</CardTitle>
            <CardDescription>
              Tổng hợp đánh giá của từng người dùng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {(() => {
                // Tạo map người dùng và đánh giá của họ
                const userRatings = new Map<number, { 
                  username: string, 
                  ratings: Array<{ chapter: string, stars: number, comment?: string, createdAt: string }> 
                }>();
                
                novel.chapters.forEach(chapter => {
                  if (chapter.ratings) {
                    chapter.ratings.forEach(rating => {
                      if (!userRatings.has(rating.userId)) {
                        userRatings.set(rating.userId, { 
                          username: rating.username, 
                          ratings: [] 
                        });
                      }
                      
                      userRatings.get(rating.userId)?.ratings.push({
                        chapter: chapter.title,
                        stars: rating.stars,
                        comment: rating.comment,
                        createdAt: rating.createdAt
                      });
                    });
                  }
                });
                
                // Chuyển map thành mảng để render
                return Array.from(userRatings.entries()).map(([userId, data]) => {
                  // Tính điểm trung bình của người dùng
                  const totalStars = data.ratings.reduce((sum, r) => sum + r.stars, 0);
                  const avgRating = parseFloat((totalStars / data.ratings.length).toFixed(1));
                  
                  return (
                    <div key={userId} className="mb-6 pb-6 border-b last:border-0">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${data.username}`} />
                            <AvatarFallback>{data.username.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{data.username}</div>
                            <div className="text-xs text-muted-foreground">
                              {data.ratings.length} đánh giá
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">{avgRating}</span>
                          <div className="flex">
                            {renderStars(avgRating)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 pl-10">
                        {data.ratings.map((rating, index) => (
                          <div key={index} className="bg-muted p-2 rounded-md">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">{rating.chapter}</span>
                              <div className="flex items-center">
                                <span className="mr-1">{rating.stars}</span>
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {new Date(rating.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {rating.comment && (
                              <p className="text-sm mt-1">{rating.comment}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 