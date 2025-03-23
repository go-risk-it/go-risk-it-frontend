export const commonStyles = {
  gradientText: {
    background: 'linear-gradient(45deg, #6366f1, #818cf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  fullHeight: {
    height: '100%',
  },
  mainContent: {
    flexGrow: 1,
    pt: '64px',
    height: '100vh',
    overflow: 'auto',
  },
  headerContainer: {
    borderBottom: 1,
    borderColor: 'divider',
  },
  menuPaper: {
    mt: 1,
    background: 'linear-gradient(180deg, #27272a 0%, #18181b 100%)',
    border: '1px solid #27272a',
    minWidth: 180,
  },
  emptyState: {
    p: 4,
    textAlign: 'center',
    background: 'transparent',
    border: '2px dashed',
    borderColor: 'divider',
  },
  sectionHeader: {
    mb: 3,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
} as const; 