# C / C++ compiler flags

Run from the source directory. Replace source and output names as needed.
Requires Clang or GCC and the appropriate sanitizer runtime.

## C++ debug build: ASan + UBSan

```sh
clang++ -std=c++20 -Wall -Wextra -Wshadow -Wconversion \
  -g -O0 -fno-omit-frame-pointer \
  -fsanitize=address,undefined main.cpp -o main
./main
```

| Flag | Meaning |
| --- | --- |
| -std=c++20 | Use C++20 |
| -Wall -Wextra | Enable common warnings, not every warning |
| -Wshadow | Warn about shadowed variables |
| -Wconversion | Warn about implicit conversions that may change values |
| -g | Include debugging symbols |
| -O0 | Disable optimization for easier debugging |
| -fno-omit-frame-pointer | Preserve frame pointers for stack traces |
| -fsanitize=address,undefined | Detect some memory errors and undefined behavior |

Use sanitizer flags during both compilation and final linking.

## C++ release build

```sh
clang++ -std=c++20 -Wall -Wextra -O2 -DNDEBUG main.cpp -o main
```

`-O2` enables general optimization. `-DNDEBUG` disables assert;
never put required side effects inside assertions. Use `g++` instead of
`clang++` for GCC.

## C debug build

```sh
clang -std=c17 -Wall -Wextra -g -O0 \
  -fsanitize=address,undefined main.c -o main
```

Use `gcc` instead of `clang` for GCC.

## Headers, libraries, and separate compilation

```sh
clang++ -std=c++20 -Iinclude -c main.cpp -o main.o
clang++ main.o -Llib -lexample -o main
```

`-I` adds a header search directory; `-c` compiles without linking.
`-L` adds a library search directory; `-lexample` links the example library
(which must exist). Put libraries after the objects that use them.
Use a build system for larger projects.
