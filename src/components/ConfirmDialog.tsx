import toast from "react-hot-toast";

export const confirmDialog = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    toast(
      (t) => (
        <div className= "flex flex-col gap-3 p-1 min-w-[250px]" >
        <p className="font-medium text-gray-900" > { message } </p>
    < div className = "flex justify-end gap-2 mt-2" >
    <button
              onClick={() => {
  toast.dismiss(t.id);
  resolve(false);
}}
className = "px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
  >
  Batal
  </button>
  < button
onClick = {() => {
  toast.dismiss(t.id);
  resolve(true);
}}
className = "px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
  >
  Ya, Lanjutkan
  </button>
  </div>
  </div>
      ),
{
  duration: Infinity,
    position: "top-center",
      style: {
    border: '1px solid #fee2e2',
        }
}
    );
  });
};
