echo -n > demos.html
for i in $(ls *.html |grep -v "ol2\|demo\|template" |sort)
  do echo '<a href="'$i'">'$i'</a><br>' >> demos.html;
done;