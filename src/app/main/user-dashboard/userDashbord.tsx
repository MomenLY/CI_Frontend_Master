import { Outlet, useLocation, useParams } from "react-router-dom";
import Header from "./common/Header";
import Footer from "./common/Footer";
function UserDashboard() {
  const location = useLocation();
  const { id, tenant_id } = useParams();

  // Define paths where the layout should include Header and Footer
  const layoutPaths = [
    "/",
    "/home",
    "/dashboard/home",
    "/dashboard/registered-events",
    `/${tenant_id}/events/${id}`,
    `/dashboard/events`
  ];

  const showLayout = layoutPaths.includes(location.pathname);

  return (
    <>
      {showLayout && <Header />}
      <div>
        <Outlet />
      </div>
      {showLayout && (
        <div className="mt-auto">
          <Footer
            linkedinLink="https://www.linkedin.com/company/congressi-internazionali"
            instagramLink="https://www.instagram.com/congressi_internazionali/"
            facebookLink="https://www.facebook.com/congressiint"
            youtubeLink="https://www.youtube.com/channel/UCrZXGbqjcgpicjWZFja2m7A"
          />
        </div>
      )}
    </>
  );
}

export default UserDashboard;
