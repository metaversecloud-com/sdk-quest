import { useContext, useState } from "react";

// components
import { Admin, Leaderboard } from "@/components";

// context
import { GlobalStateContext } from "@context/GlobalContext";

export const Home = () => {
  const [activeTab, setActiveTab] = useState("leaderboard");

  // context
  const { keyAssetImage, visitor } = useContext(GlobalStateContext);

  return (
    <div className="container p-6 items-center justify-center">
      {visitor && visitor.isAdmin && (
        <div className="flex flex-col items-end mb-6">
          <div className="tab-container">
            <button
              className={activeTab !== "admin" ? "btn" : "btn btn-text"}
              onClick={() => setActiveTab("leaderboard")}
            >
              Leaderboard
            </button>
            <button className={activeTab === "admin" ? "btn" : "btn btn-text"} onClick={() => setActiveTab("admin")}>
              Admin
            </button>
          </div>
        </div>
      )}
      {keyAssetImage ? <img alt="Find me" className="mx-auto" src={keyAssetImage} /> : <div />}
      <div className="flex flex-col mb-6 mt-4">
        <h1 className="h2 text-center">Quest</h1>
      </div>
      {activeTab === "admin" ? (
        <Admin keyAssetImage={keyAssetImage} />
      ) : (
        <Leaderboard isKeyAsset={true} keyAssetImage={keyAssetImage} />
      )}
    </div>
  );
};

export default Home