
interface SidebarProps {
  userInfo: { nickname: string; fullName: string; phone: string };
  onLogout: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}


export default function Sidebar({ userInfo, onLogout, isSidebarOpen, setIsSidebarOpen, }: SidebarProps) {

  return (
    <>
      {/* Toggle Button (Visible on Small Screens) */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="bg-gray-800 text-gray-200 p-2 rounded fixed top-4 left-4 z-50 block md:hidden"
      >
        {isSidebarOpen ? "Close" : "Menu"}
      </button>

      {/* Sidebar */}
      <div
        className={`flex-1 bg-gray-800 text-gray-200 w-64 p-4 h-full fixed top-0 left-0 z-40 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform`}
      >
        <p className="mb-2"><br></br><br></br></p>
        <h2 className="text-xl font-bold mb-4">Moin, {userInfo.nickname}!</h2>
        <button
          onClick={onLogout}
          className="bg-red-500 text-gray-200 py-2 px-4 rounded w-full"
        >
          Logout
        </button>
      </div>

      {/* Overlay for Sidebar (on small screens) */}
      {/* {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
        ></div>
      )} */}
    </>
  );
}
