import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { MessageCircle, UserCircle2, Loader2, AlertCircle, Send, ImagePlus, X, Pin } from 'lucide-react';
import { supabase } from '../supabase';
import { usePortfolio } from '../context/PortfolioContext';

const Comment = memo(({ comment, formatDate, isPinned = false, accent }) => (
    <div 
        className={`px-4 pt-4 pb-3 rounded-xl border transition-all ${
            isPinned 
                ? `${accent?.bgSubtle || 'bg-emerald-500/10'} ${accent?.border || 'border-emerald-500/30'}` 
                : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
        }`}
    >
        {isPinned && (
            <div className={`flex items-center gap-1.5 mb-2 ${accent?.text || 'text-emerald-600 dark:text-emerald-400'}`}>
                <Pin className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Catatan Disematkan</span>
            </div>
        )}
        <div className="flex items-start gap-3">
            {comment.profile_image ? (
                <img
                    src={comment.profile_image}
                    alt={`${comment.user_name}'s profile`}
                    className={`w-9 h-9 rounded-full object-cover border flex-shrink-0 ${
                        isPinned ? (accent?.border || 'border-emerald-500/50') : 'border-zinc-300 dark:border-zinc-700'
                    }`}
                    loading="lazy"
                />
            ) : (
                <div className={`p-1.5 rounded-full text-zinc-500 dark:text-zinc-400 ${
                    isPinned ? `${accent?.bgSubtle || 'bg-emerald-500/20'} ${accent?.text || 'text-emerald-600 dark:text-emerald-400'}` : 'bg-zinc-200 dark:bg-zinc-800'
                }`}>
                    <UserCircle2 className="w-5 h-5" />
                </div>
            )}
            <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {comment.user_name}
                        </h4>
                        {isPinned && (
                            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${accent?.badge || 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'}`}>
                                Penulis
                            </span>
                        )}
                    </div>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                        {formatDate(comment.created_at)}
                    </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 break-words leading-relaxed">
                    {comment.content}
                </p>
            </div>
        </div>
    </div>
));

const CommentForm = memo(({ onSubmit, isSubmitting, error, accent, buttonRadiusClass }) => {
    const [newComment, setNewComment] = useState('');
    const [userName, setUserName] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleImageChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Ukuran foto harus kurang dari 5MB.');
                if (e.target) e.target.value = '';
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('Silakan pilih berkas gambar yang valid.');
                if (e.target) e.target.value = '';
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    }, []);

    const handleTextareaChange = useCallback((e) => {
        setNewComment(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, []);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (!newComment.trim() || !userName.trim()) return;
        
        onSubmit({ newComment, userName, imageFile });
        setNewComment('');
        setUserName('');
        setImagePreview(null);
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }, [newComment, userName, imageFile, onSubmit]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Nama Anda <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        maxLength={25}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-800 dark:focus:border-zinc-200 transition-colors"
                        required
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Foto Profil <span className="text-zinc-400 font-normal">(opsional)</span>
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                        {imagePreview ? (
                            <div className="flex items-center gap-2">
                                <img
                                    src={imagePreview}
                                    alt="Pratinjau"
                                    className={`w-8 h-8 rounded-full object-cover border ${accent?.border || 'border-zinc-400'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview(null);
                                        setImageFile(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="text-xs text-red-500 hover:text-red-600 transition-colors"
                                >
                                    Hapus
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <ImagePlus className="w-3.5 h-3.5" />
                                <span>Pilih foto</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Pesan / Komentar <span className="text-red-500">*</span>
                </label>
                <textarea
                    ref={textareaRef}
                    value={newComment}
                    maxLength={300}
                    onChange={handleTextareaChange}
                    placeholder="Tulis pesan, tanggapan, atau salam Anda di sini..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-800 dark:focus:border-zinc-200 transition-colors resize-none min-h-[90px]"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 py-2 px-5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm active:scale-95 disabled:opacity-50"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengirim pesan...</span>
                    </>
                ) : (
                    <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Komentar</span>
                    </>
                )}
            </button>
        </form>
    );
});

const Komentar = () => {
    const { accent, buttonRadiusClass, cardRadiusClass } = usePortfolio();
    const [comments, setComments] = useState([]);
    const [pinnedComment, setPinnedComment] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPinnedComment = async () => {
            try {
                const { data, error } = await supabase
                    .from('portfolio_comments')
                    .select('*')
                    .eq('is_pinned', true)
                    .single();
                
                if (error && error.code !== 'PGRST116') return;
                if (data) setPinnedComment(data);
            } catch (err) {
                // Ignore
            }
        };

        fetchPinnedComment();
    }, []);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const { data, error } = await supabase
                    .from('portfolio_comments')
                    .select('*')
                    .eq('is_pinned', false)
                    .order('created_at', { ascending: false });
                
                if (error) return;
                setComments(data || []);
            } catch (err) {
                // Ignore
            }
        };

        fetchComments();

        const subscription = supabase
            .channel('portfolio_comments')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'portfolio_comments',
                    filter: 'is_pinned=eq.false'
                }, 
                () => {
                    fetchComments();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const uploadImage = useCallback(async (imageFile) => {
        if (!imageFile) return null;
        
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `profile-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('profile-images')
            .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('profile-images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }, []);

    const handleCommentSubmit = useCallback(async ({ newComment, userName, imageFile }) => {
        setError('');
        setIsSubmitting(true);
        
        try {
            const profileImageUrl = await uploadImage(imageFile);
            
            const { error } = await supabase
                .from('portfolio_comments')
                .insert([
                    {
                        content: newComment,
                        user_name: userName,
                        profile_image: profileImageUrl,
                        is_pinned: false,
                        created_at: new Date().toISOString()
                    }
                ]);

            if (error) throw error;
        } catch (err) {
            setError('Gagal mengirim komentar. Pastikan koneksi Supabase terhubung.');
        } finally {
            setIsSubmitting(false);
        }
    }, [uploadImage]);

    const formatDate = useCallback((timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) return 'Baru saja';
        if (diffMinutes < 60) return `${diffMinutes}m lalu`;
        if (diffHours < 24) return `${diffHours}j lalu`;
        if (diffDays < 7) return `${diffDays}h lalu`;

        return new Intl.DateTimeFormat('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    }, []);

    const totalComments = comments.length + (pinnedComment ? 1 : 0);

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-2">
                    <MessageCircle className={`w-4 h-4 ${accent?.text || 'text-emerald-600 dark:text-emerald-400'}`} />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        Umpan Diskusi & Buku Tamu
                    </h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    {totalComments} komentar
                </span>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}
            
            <CommentForm
                onSubmit={handleCommentSubmit}
                isSubmitting={isSubmitting}
                error={error}
                accent={accent}
                buttonRadiusClass={buttonRadiusClass}
            />

            <div className="space-y-3 max-h-[360px] overflow-y-auto pt-2 pr-1">
                {pinnedComment && (
                    <Comment 
                        comment={pinnedComment} 
                        formatDate={formatDate}
                        isPinned={true}
                        accent={accent}
                    />
                )}
                
                {comments.length === 0 && !pinnedComment ? (
                    <div className="text-center py-8">
                        <UserCircle2 className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-50" />
                        <p className="text-xs text-zinc-500">Belum ada komentar publik. Jadilah yang pertama meninggalkan pesan!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <Comment 
                            key={comment.id} 
                            comment={comment} 
                            formatDate={formatDate}
                            isPinned={false}
                            accent={accent}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default Komentar;
