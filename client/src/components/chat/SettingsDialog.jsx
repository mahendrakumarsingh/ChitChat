import { useState, useRef } from 'react';
import { Camera, User, Mail, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const SettingsDialog = ({ open, onOpenChange, currentUser, onUpdateProfile }) => {
    const [name, setName] = useState(currentUser?.name || '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(currentUser?.avatar || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('name', name);
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        const res = await onUpdateProfile(formData);
        setLoading(false);

        if (res.success) {
            setSuccess('Profile updated successfully');
            setTimeout(() => {
                setSuccess('');
                onOpenChange(false);
            }, 1500);
        } else {
            setError(res.error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-[var(--surface)] border-[var(--surface-light)] text-[var(--text-primary)]">
                <DialogHeader>
                    <DialogTitle>Profile Settings</DialogTitle>
                    <DialogDescription className="text-[var(--text-muted)]">
                        Update your profile information and avatar.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <Avatar className="w-24 h-24 ring-4 ring-[var(--surface-light)] group-hover:ring-[var(--electric-blue)] transition-all">
                                <AvatarImage src={previewUrl} className="object-cover" />
                                <AvatarFallback className="bg-[var(--surface-light)] text-2xl">
                                    {currentUser?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <p className="text-xs text-[var(--text-muted)]">Click to change avatar</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                                Full Name
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10 bg-[var(--surface-light)] border-transparent focus:border-[var(--electric-blue)]"
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                                Username (Read-only)
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">@</span>
                                <Input
                                    value={currentUser?.username || ''}
                                    disabled
                                    className="pl-8 bg-[var(--surface-light)]/50 border-transparent text-[var(--text-muted)]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                                Email (Read-only)
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                <Input
                                    value={currentUser?.email || ''}
                                    disabled
                                    className="pl-10 bg-[var(--surface-light)]/50 border-transparent text-[var(--text-muted)]"
                                />
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-500 text-sm">{success}</p>}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="hover:bg-[var(--surface-light)]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-[var(--electric-blue)] hover:bg-[var(--electric-blue)]/80"
                        >
                            {loading ? (
                                'Saving...'
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
