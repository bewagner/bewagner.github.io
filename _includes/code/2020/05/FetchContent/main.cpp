#define DOCTEST_CONFIG_IMPLEMENT_WITH_MAIN

#include <vector>
#include "doctest/doctest.h"
#include "range/v3/view.hpp"
#include "range/v3/numeric/accumulate.hpp"

int f(const std::vector<int> &v) {

    auto square = [](int i){ return i * i; };

    int sum = ranges::accumulate(v
      | ranges::views::transform(square)
      | ranges::views::take(10)
      , 0);

    return sum;
}

TEST_CASE ("Test function") {
            CHECK(f({1, 2, 3}) == 14);
            CHECK(f({1, 2, 3, 4, 5, 
                6, 7, 8, 9, 10, 11, 12}) == 385);
            CHECK(f({}) == 0);
}

