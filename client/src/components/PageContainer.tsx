import { ReactNode, useContext, useState } from "react";

// components
import { AdminIconButton, Loading, Admin } from "@/components";

// context
import { GlobalStateContext } from "@context/GlobalContext";

export const PageContainer = ({ children, isLoading }: { children: ReactNode; isLoading: boolean }) => {
  const { error, questDetails, visitor } = useContext(GlobalStateContext);
  const { questItemImage } = questDetails || {};
  const { isAdmin } = visitor || {};

  const [showSettings, setShowSettings] = useState(false);

  if (isLoading) return <Loading />;

  return (
    <div className="p-4 mb-28">
      {isAdmin && (
        <AdminIconButton setShowSettings={() => setShowSettings(!showSettings)} showSettings={showSettings} />
      )}
      {questItemImage ? <img alt="Find me" className="mx-auto" src={questItemImage} /> : <div />}
      <div className="flex flex-col mb-4 mt-2">
        <h1 className="h2 text-center">Quest</h1>
      </div>
      {showSettings ? <Admin /> : children}
      {error && <p className="p3 pt-10 text-center text-error">{error}</p>}
    </div>
  );
};

export default PageContainer;
