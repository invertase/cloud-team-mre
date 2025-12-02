
import { getAuth } from 'firebase/auth';

import { useEffect, useState } from 'react';



export function AdminProtected({ children }: { children: React.ReactNode }) {

const [isAdmin, setIsAdmin] = useState(false);

const auth = getAuth();



useEffect(() => {

return auth.onIdTokenChanged(async (user) => {

if (user) {

    // For development purposes, allow all authenticated users

    setIsAdmin(true);



    // In production, you would check for admin claims:

    // const token = await user.getIdTokenResult();

    // setIsAdmin(!!token.claims.admin);

} else {

    setIsAdmin(false);

}

});

}, []);



if (!isAdmin) {

return (

<div className="min-h-screen flex items-center justify-center bg-gray-100">

    <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">

    <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>

    <p className="text-gray-600 mb-4">

        You are not authorized to access this application. Please contact your administrator

        if you believe this is a mistake.

    </p>

    <button

        onClick={() => auth.signOut()}

        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"

    >

        Sign Out

    </button>

    </div>

</div>

);

}



return <>{children}</>;

}
