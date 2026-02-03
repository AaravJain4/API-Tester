import './Header.css';

const Header = ({ showEnv, setShowEnv, showHistory, setShowHistory }) => {
    return (
        <header className="header">
            <div className="header-content">
                <div className="logo">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <rect width="32" height="32" rx="8" fill="url(#gradient)" />
                        <path
                            d="M16 8L22 12V20L16 24L10 20V12L16 8Z"
                            stroke="white"
                            strokeWidth="2"
                            fill="none"
                        />
                        <circle cx="16" cy="16" r="3" fill="white" />
                        <defs>
                            <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                                <stop offset="0%" stopColor="hsl(220, 75%, 55%)" />
                                <stop offset="100%" stopColor="hsl(260, 75%, 60%)" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <h1>API Tester Pro</h1>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-secondary btn-icon"
                        onClick={() => setShowEnv(!showEnv)}
                        title="Environment Variables"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 1v6m0 6v6m8.66-15.66l-4.24 4.24m-4.24 4.24l-4.24 4.24m15.66-8.66l-4.24-4.24m-4.24-4.24l-4.24-4.24" />
                        </svg>
                    </button>
                    <button
                        className="btn btn-secondary btn-icon"
                        onClick={() => setShowHistory(!showHistory)}
                        title="Request History"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
