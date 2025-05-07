import { useCallback, useEffect, useRef, useState } from "react";
import UserCard from "./UserCard";
import { getAdmins } from "./api/Get-All-Admins";
import { motion } from "framer-motion";
import FuseLoading from "@fuse/core/FuseLoading";
import OnionNotFound from "app/shared-components/components/OnionNotFound";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setShouldUpdate } from "src/app/auth/user/store/adminSlice";
import { useLocation, useNavigate } from "react-router";
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getRoles } from "app/shared-components/cache/cacheCallbacks";
import * as _ from "lodash";

type Props = {
  keyword?: string;
};

function AdminManagementContent({ keyword }: Props) {
  const [admins, setAdmins] = useState({});
  const [roles, setRoles] = useState({});
  const [loading, setLoading] = useState<boolean>(true);
  const [reload, setReload] = useState<boolean>(false);
  const dispatch = useDispatch();
  const shouldUpdate = useSelector((state) => state.userList.shouldUpdate);
  const location = useLocation();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [hasMoreAdmins, setHasMoreAdmins] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const lastAdminItemRef = useRef(null);

  useEffect(() => {
    const _init = async () => {
      const _roles = await LocalCache.getItem(cacheIndex.roles, getRoles.bind(null));
      const _roleObj = _roles.reduce((_prevRoles, role) => {
        _prevRoles[String(role._id)] = { name: role.name };
        return _prevRoles;
      }, {});
      setRoles(_roleObj ? _roleObj : {});
    };
    _init();
  }, []);

  const listAdmins = useCallback(
    _.debounce(async (keyword, page) => {
      setIsFetching(true);
      try {
        const response = await getAdmins(keyword, page);
        const newAdmins = response?.data?.items || [];

        setAdmins((prevAdmins) => {
          const updatedAdmins = { ...prevAdmins };
          newAdmins.forEach((admin) => {
            updatedAdmins[admin._id] = admin;
          });
          return updatedAdmins;
        });

        setHasMoreAdmins(newAdmins.length === 9);
        setIsFetching(false);
      } catch (error) {
        setLoading(false);
        throw error;
      } finally {
        setIsFetching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    setAdmins({});
    setPage(1);
    listAdmins(keyword, 1);
    dispatch(setShouldUpdate(false));
    const searchParams = new URLSearchParams(location.search);
    if (keyword) {
      searchParams.set("keyword", keyword);
    } else {
      searchParams.delete("keyword");
    }
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  }, [keyword, reload, shouldUpdate]);

  useEffect(() => {
    if (page > 1) {
      listAdmins(keyword, page);
    }
  }, [page]);

  useEffect(() => {
    if (!isFetching && hasMoreAdmins && lastAdminItemRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setPage((prevPage) => prevPage + 1);
            }
          });
        },
        { root: null, threshold: 1 }
      );

      observer.observe(lastAdminItemRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [isFetching, hasMoreAdmins]);

  const handleAdminModify = (user) => {
    setAdmins((prevState) => {
      return {
        ...prevState,
        [user.id]: {
          ...prevState[user.id],
          status: user.status,
        },
      };
    });
  };

  const getRoleAttribute = (roleIds, attribute) => {
    const roleAttributes = [];
    roleIds.length > 0 &&
      roleIds.map((roleId) => {
        if (
          typeof roles[roleId] !== "undefined" &&
          typeof roles[roleId][attribute] !== "undefined"
        ) {
          roleAttributes.push(roles[roleId][attribute]);
        }
      });

    return roleAttributes;
  };

  let count = Object.keys(admins).length;  
  if (isFetching && count === 0) {
    return <FuseLoading />;
  }

  if (count === 0) {
    return <OnionNotFound />;
  }

  return (
    <div className="w-full container flex flex-col md:p-24 p-16">
      <motion.div
        initial="hidden"
        animate="show"
        className="grid sm:grid-cols-2 gap-6 sm:gap-10 md:grid-cols-3 md:gap-14 lg:grid-cols-3 lg:gap-20 xl:grid-cols-4"
      >
        {Object.entries(admins).map(([key, admin]: [string, any], index) => (
          <div
            key={admin._id}
            ref={index === Object.keys(admins).length - 1 ? lastAdminItemRef : null}
          >
            <UserCard
              user={{
                id: admin._id,
                name: admin.firstName + " " + admin.lastName,
                email: admin.email,
                roles: getRoleAttribute(admin.roleIds, "name").join(","),
                number: admin.phoneNumber,
                status: admin.status,
                profilePic:
                  "https://react-material.fusetheme.com/assets/images/avatars/brian-hughes.jpg",
              }}
              onUserModify={handleAdminModify}
              setReload={setReload}
            />
          </div>
        ))}
      </motion.div>
      {isFetching && hasMoreAdmins && (
        <div className="w-full flex justify-center mt-4">
          <FuseLoading />
        </div>
      )}
      {/* {!hasMoreAdmins && (
        <div className="w-full flex justify-center mt-4 text-gray-500">
          No more admins to load
        </div>
      )} */}
    </div>
  );
}

export default AdminManagementContent;