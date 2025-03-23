import { useAuth } from "../../hooks/useAuth.ts"
import ShowGames from "./ShowGames.tsx"
import ShowLobbies from "./ShowLobbies.tsx"
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Container, 
    Box, 
    Button, 
    ThemeProvider, 
    CssBaseline,
    Tabs,
    Tab,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider
} from "@mui/material"
import {
    LogoutRounded,
    SportsEsports as GamesIcon,
    Groups as LobbiesIcon,
    AccountCircle
} from "@mui/icons-material"
import React, { useState } from "react"
import { theme } from "../../theme"

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
            style={{ height: '100%' }}
        >
            {value === index && (
                <Box sx={{ height: '100%', pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const Home: React.FC = () => {
    const { session, signout } = useAuth()
    const [tabValue, setTabValue] = useState(0)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue)
    }

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
    }

    const handleSignOut = () => {
        handleMenuClose()
        signout()
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                minHeight: '100vh',
                backgroundColor: 'background.default'
            }}>
                <AppBar position="fixed" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Container maxWidth="xl">
                        <Toolbar disableGutters>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    background: 'linear-gradient(45deg, #6366f1, #818cf8)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontWeight: 700,
                                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                                    mr: 4
                                }}
                            >
                                Risk It All
                            </Typography>

                            <Tabs 
                                value={tabValue} 
                                onChange={handleTabChange}
                                sx={{ flexGrow: 1 }}
                            >
                                <Tab 
                                    icon={<GamesIcon />} 
                                    label="Active Games" 
                                    iconPosition="start"
                                />
                                <Tab 
                                    icon={<LobbiesIcon />} 
                                    label="Lobbies" 
                                    iconPosition="start"
                                />
                            </Tabs>

                            <IconButton
                                onClick={handleMenuClick}
                                size="small"
                                sx={{ ml: 2 }}
                            >
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                    <AccountCircle />
                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                                PaperProps={{
                                    sx: {
                                        mt: 1,
                                        background: 'linear-gradient(180deg, #27272a 0%, #18181b 100%)',
                                        border: '1px solid #27272a',
                                        minWidth: 180
                                    }
                                }}
                            >
                                <MenuItem>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                        Signed in as
                                    </Typography>
                                </MenuItem>
                                <MenuItem>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {session?.user?.id}
                                    </Typography>
                                </MenuItem>
                                <Divider sx={{ my: 1, borderColor: '#27272a' }} />
                                <MenuItem onClick={handleSignOut}>
                                    <LogoutRounded sx={{ mr: 2, fontSize: 20 }} />
                                    <Typography>Sign out</Typography>
                                </MenuItem>
                            </Menu>
                        </Toolbar>
                    </Container>
                </AppBar>

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        pt: '64px', // AppBar height
                        height: '100vh',
                        overflow: 'auto'
                    }}
                >
                    <Container maxWidth="xl" sx={{ py: 3, height: '100%' }}>
                        <TabPanel value={tabValue} index={0}>
                            <ShowGames />
                        </TabPanel>
                        <TabPanel value={tabValue} index={1}>
                            <ShowLobbies />
                        </TabPanel>
                    </Container>
                </Box>
            </Box>
        </ThemeProvider>
    )
}

export default Home