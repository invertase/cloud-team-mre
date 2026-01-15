# Deploying Local Code Changes in firebase-functions, firebase-functions-python, and firebase-functions-test

## firebase-functions

1. Once you have made the changes to the code in **firebase-functions**, you then want to run `npm build && npm pack` (or `npm build; npm pack` on Windows). This command will first compile the source, then bundles the compiled output into a tarball file, which should be named something like *firebase-functions-1.2.3.tgz .*
2. Move the generated *.tgz* file into the functions directory (e.g. *./functions*). Note that it must be within the functions directory, otherwise it won’t work ([relevant issue](https://github.com/firebase/firebase-tools/issues/8358)).
3. Once the generated *.tgz* file is in your function’s directory, you should then run `npm i filename.tgz` (replacing `filename` with the name of your *.tgz* file. This command will install your changes, and so your functions code will be able to use the changes. Do not get rid of the *.tgz* file, this now resides in there.
4. Done. You can now deploy using `firebase deploy`.

Note: You’ll have to reiterate through these steps every time you wish to test your local changes.

## firebase-functions-python

1. Once you have made the changes to the code in **firebase-functions-python**, you then want to run `pip install build` (you may need to activate your [virtual environment](https://www.w3schools.com/python/python_virtualenv.asp) before running this using `your_path_to\venv\Scripts\activate`). This command will install the required pacakage to build.
2. After installing the necessary package, let’s use `python -m build` to build. This will produce a tarball file named something similar to *firebase_functions-1.2.3.tar.gz* inside of the */dist* directory. Move this generated file into your functions directory (e.g. *./functions*). Note that it must be within the functions directory, otherwise it won’t work ([relevant issue](https://github.com/firebase/firebase-tools/issues/8358)).
3. Open your `requirements.txt` file in your function’s directory and add the generated file, for instance *./firebase_functions-1.2.3.tar.gz* (use the name of your generated file).
4. Finally, activate your function’s virtual environment and install the requirements with `pip install -r requirements.txt`. This will install the local changes you have made to **firebase-functions-python**.

Note: You’ll have to reiterate through these steps every time you wish to test your local changes.

## firebase-functions-test

1. Once you have made the changes to the code in **firebase-functions-test**, you then want to run `npm build && npm pack` (or `npm build; npm pack` on Windows). This command will first compile the source, then bundles the compiled output into a tarball file, which should be named something like *firebase-functions-test-1.2.3.tgz .*
2. Move the generated *.tgz* file into the functions directory (e.g. *./functions*).
3. Once the generated *.tgz* file is in your function’s directory, you should then run `npm i filename.tgz` (replacing `filename` with the name of your *.tgz* file. This command will install your changes, and so your functions code will be able to use the changes. Do not get rid of the *.tgz* file, this now resides in there.
4. Done. You can now write tests using your local changes.

Note: You’ll have to reiterate through these steps every time you wish to test your local changes.