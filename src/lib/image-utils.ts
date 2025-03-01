export const getImageUrl = (path: string) => {
  // Kiểm tra nếu là URL đầy đủ
  if (path.startsWith('http')) {
    return path
  }
  // Nếu không, thêm domain của ứng dụng
  return `${process.env.NEXT_PUBLIC_APP_URL || ''}${path}`
}

export const getNovelCoverUrl = (filename: string) => {
  return `/images/novels/${filename}`
}

export const getAuthorAvatarUrl = (filename: string) => {
  return `/images/authors/${filename}`
}

export const getUserAvatarUrl = (filename: string) => {
  return `/images/users/${filename}`
} 