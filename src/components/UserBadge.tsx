import { useState } from 'react';

interface UserBadgeProps {
  name: string;
  avatarKey?: string;
  size?: number;
}

export default function UserBadge({ name, avatarKey, size = 24 }: UserBadgeProps) {
  const [imgError, setImgError] = useState(false);
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className="user-badge" title={name}>
      {avatarKey && !imgError ? (
        <img
          src={avatarKey}
          alt={name}
          width={size}
          height={size}
          style={{ borderRadius: '50%', objectFit: 'cover' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className="avatar-fallback"
          style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
          {initials}
        </span>
      )}
      <span className="user-badge-name">{name}</span>
    </span>
  );
}
