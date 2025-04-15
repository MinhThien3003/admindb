import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

// Import model
let ReaderLevel;
try {
  ReaderLevel = mongoose.model('ReaderLevel');
} catch {
  const ReaderLevelSchema = new mongoose.Schema({
    level: { type: Number, required: true, unique: true },
    requiredExp: { type: Number, required: true },
    title: { type: String, required: true },
  }, { timestamps: true, collection: "ReaderLevels" });
  
  ReaderLevel = mongoose.model('ReaderLevel', ReaderLevelSchema);
}

// GET - Lấy cấp độ độc giả theo ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const id = params.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'ID không hợp lệ' },
        { status: 400 }
      );
    }
    
    const readerLevel = await ReaderLevel.findById(id);
    
    if (!readerLevel) {
      return NextResponse.json(
        { message: 'Không tìm thấy cấp độ độc giả' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(readerLevel, { status: 200 });
  } catch (error) {
    console.error('Error fetching reader level:', error);
    return NextResponse.json(
      { message: 'Lỗi khi lấy thông tin cấp độ độc giả' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật cấp độ độc giả
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const id = params.id;
    const data = await req.json();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'ID không hợp lệ' },
        { status: 400 }
      );
    }
    
    // Validate required fields if provided
    if (data.level === undefined && data.requiredExp === undefined && data.title === undefined) {
      return NextResponse.json(
        { message: 'Không có thông tin cập nhật' },
        { status: 400 }
      );
    }
    
    // Check if level already exists (if updating level)
    if (data.level !== undefined) {
      const existingLevel = await ReaderLevel.findOne({ 
        level: data.level,
        _id: { $ne: id }
      });
      
      if (existingLevel) {
        return NextResponse.json(
          { message: 'Cấp độ này đã tồn tại' },
          { status: 400 }
        );
      }
    }
    
    // Update reader level
    const updatedReaderLevel = await ReaderLevel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!updatedReaderLevel) {
      return NextResponse.json(
        { message: 'Không tìm thấy cấp độ độc giả' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedReaderLevel, { status: 200 });
  } catch (error) {
    console.error('Error updating reader level:', error);
    return NextResponse.json(
      { message: 'Lỗi khi cập nhật cấp độ độc giả' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa cấp độ độc giả
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const id = params.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'ID không hợp lệ' },
        { status: 400 }
      );
    }
    
    const deletedReaderLevel = await ReaderLevel.findByIdAndDelete(id);
    
    if (!deletedReaderLevel) {
      return NextResponse.json(
        { message: 'Không tìm thấy cấp độ độc giả' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Xóa cấp độ độc giả thành công' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting reader level:', error);
    return NextResponse.json(
      { message: 'Lỗi khi xóa cấp độ độc giả' },
      { status: 500 }
    );
  }
}
