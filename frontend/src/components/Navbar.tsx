import { Link, useNavigate } from 'react-router-dom';
import { User, PartyPopper, Menu} from 'lucide-react';
// import { MarqueeText } from '@/components/MarqueeText';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/api/hooks/use-auth';

interface NavBarProps {
    onLogout: () => Promise<void>;
  }

export const Navbar = ({ onLogout }: NavBarProps) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            await onLogout()
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };


    // const navigationItems = [
    //     { name: 'Programm', path: '#programm' },
    //     { name: 'Galery', path: '#galery' },

    // ];


    return (
        <div className="fixed w-full z-20">
            {/* <MarqueeText
                text="Jetzt Zuschlagen! 0% Rabatt auf alle Tickets - Nur vom 15.01. bis 15.02."
                speed={5}
                className="bg-custom-aquamarine py-2 border-b"
                textClassName="text-black font-medium tracking-wider text-sm"
                separator="✦"
            /> */}

            <nav className="w-full h-16 bg-white text-black border-b-2 border-solid border-black">
                <div className="max-w-7xl h-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-full justify-between items-center">
                        <div className="flex-shrink-0">
                            <Link to="/home" className="flex items-center group">
                                <PartyPopper className='mr-4'></PartyPopper>
                                <span className="text-2xl font-bold hover:transition-colors duration-200">
                                    schoenfeld.
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-4">
                            {/* Navigation Items */}
                            {/* {navigationItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className="text-black hover:text-gray-600 font-medium transition-colors duration-200"
                                >
                                    {item.name}
                                </Link>
                            ))} */}

                            {/* <MusicPlayer /> */}

                            <Link to="/spot">
                                <Button
                                    variant="ghost"
                                    className="rounded-full border-solid border-2 border-black gap-2 bg-custom-aquamarine transition-all duration-200"
                                >
                                    Mein Ticket
                                </Button>
                            </Link>

                            {user?.type === 'admin' && (
                                <Link to="/admin">
                                    <Button
                                        variant="ghost"
                                        className="rounded-full border-solid border-2 border-black gap-2 bg-custom-aquamarine transition-all duration-200"
                                    >
                                        Admin Panel
                                    </Button>
                                </Link>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full w-10 h-10 border-solid border-2 border-black gap-2 bg-custom-aquamarine"
                                    >
                                        <User className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-48 text-black bg-gradient-to-br from-custom-light-cyan to-custom-aquamarine/90 backdrop-blur-md rounded-xl border-custom-mauve/40 shadow-xl"
                                >
                                    <DropdownMenuItem
                                        onClick={() => navigate('/user')}
                                        className="text-black hover:bg-custom-pink/40 m-1 rounded-lg cursor-pointer"
                                    >
                                        Mein Profil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="text-black  hover:bg-custom-pink/40 m-1 rounded-lg cursor-pointer"
                                    >
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Mobile Menu */}
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full w-10 h-10 border-solid border-2 border-black bg-custom-aquamarine"
                                    >
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="w-64 bg-gradient-to-br from-custom-light-cyan to-custom-aquamarine/90 backdrop-blur-md border-custom-mauve/40">
                                    <div className="flex flex-col gap-4 mt-8">
                                        {/* Mobile Navigation Items */}
                                        {/* {navigationItems.map((item) => (
                                            <SheetClose key={item.name} asChild>
                                                <Link to={item.path}>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full rounded-full border-solid border-2 border-black gap-2 bg-custom-aquamarine"
                                                    >
                                                        {item.name}
                                                    </Button>
                                                </Link>
                                            </SheetClose>
                                        ))} */}

                                        {/* <MusicPlayer /> */}

                                        <SheetClose asChild>
                                                <Link to="/spot">
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full rounded-full border-solid border-2 border-black gap-2 bg-custom-aquamarine"
                                                    >
                                                        Mein Ticket
                                                    </Button>
                                                </Link>
                                            </SheetClose>

                                        {user?.type === 'admin' && (
                                            <SheetClose asChild>
                                                <Link to="/admin">
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full rounded-full border-solid border-2 border-black gap-2 bg-custom-aquamarine"
                                                    >
                                                        Admin Panel
                                                    </Button>
                                                </Link>
                                            </SheetClose>
                                        )}

                                        <SheetClose asChild>
                                            <Button
                                                variant="ghost"
                                                className="w-full rounded-full border-solid border-2 border-black gap-2 bg-custom-aquamarine"
                                                onClick={() => navigate('/user')}
                                            >
                                                Mein Profil
                                            </Button>
                                        </SheetClose>

                                        <SheetClose asChild>
                                            <Button
                                                variant="ghost"
                                                className="w-full rounded-full border-solid border-2 border-black gap-2 bg-custom-aquamarine"
                                                onClick={handleLogout}
                                            >
                                                Logout
                                            </Button>
                                        </SheetClose>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
};