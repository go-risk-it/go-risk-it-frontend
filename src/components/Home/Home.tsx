import { useAuth } from "../../hooks/useAuth.ts"
import ShowGames from "./ShowGames.tsx"
import ShowLobbies from "./ShowLobbies.tsx"
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Container, 
    Box, 
    ThemeProvider, 
    CssBaseline,
    Tabs,
    Tab,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Stack
} from "@mui/material"
import {
    LogoutRounded,
    SportsEsports as GamesIcon,
    Groups as LobbiesIcon,
    AccountCircle
} from "@mui/icons-material"
import React, { useState } from "react"
import { theme } from "../../theme"
import { commonStyles } from "../../styles/common.styles"

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
        >
            {value === index && (
                <Box sx={commonStyles.fullHeight}>
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
                bgcolor: 'background.default'
            }}>
                <AppBar position="fixed" color="inherit" elevation={0} sx={commonStyles.headerContainer}>
                    <Container maxWidth="xl">
                        <Toolbar disableGutters>
                            <Typography 
                                variant="h6" 
                                sx={{
                                    ...commonStyles.gradientText,
                                    fontWeight: 700,
                                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                                    mr: { xs: 2, sm: 4 }
                                }}
                            >
                                Risk It All
                            </Typography>

                            <Tabs 
                                value={tabValue} 
                                onChange={handleTabChange}
                                sx={{ 
                                    flexGrow: 1,
                                    '& .MuiTab-root': {
                                        minWidth: 'auto',
                                        px: { xs: 1, sm: 2 }
                                    }
                                }}
                            >
                                <Tab 
                                    icon={<GamesIcon />} 
                                    label={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>Active Games</Box>}
                                    aria-label="Active Games"
                                />
                                <Tab 
                                    icon={<LobbiesIcon />} 
                                    label={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>Lobbies</Box>}
                                    aria-label="Lobbies"
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
                                slotProps={{
                                    paper: { sx: commonStyles.menuPaper }
                                }}
                            >
                                <Stack spacing={0.5} px={2} py={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        Signed in as
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {session?.user?.id}
                                    </Typography>
                                </Stack>
                                <Divider sx={{ borderColor: 'divider' }} />
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
                    sx={commonStyles.mainContent}
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