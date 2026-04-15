import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="min-h-screen bg-gray-50">
        <h1 className="text-3xl font-bold text-center py-10 text-gray-800">
          Event Booking System
        </h1>
      </div>
    </>
  );
};

export default App;
