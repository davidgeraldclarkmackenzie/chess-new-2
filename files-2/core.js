const PIECE_IMGS={
  bK:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAA/1BMVEVmZmlaWl9lZWl8c2OnpqkvLzLJzssuLjOVlJYkDw8oL0DZ2twzM2Y9QD97eYCAbVeysrKLiYoAAAA5QUgkJjIdIzMWGSYyOkUJChITFBxDS1QyMjZzZVRmWUxRUlKMeWQoIR1PWmN/f39GOzRRRDj///83NzdWVlYmHhxqaW0lJi1VYmpUVFhmZmmDc1oiHiNGRktRUVVnZ2eFhYZISEyTgmhmZWhsZmV4eHl4eHmLjY2NjpCbm5uWlJqpqavX19UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACmzbpoAAAAQHRSTlMrnmnzU6Ee0pMH/1YF6qH+CtkA/v7+/v79/v39/v7+/v//Av7/BgQE/5TQ/9Gp//zNaAVwrf907FWTLVEJMTMn/fv79gAAA6tJREFUeNqFVoli4jgMDYUec+6urdiynUDJAZSWo0PP6fX/fzWSHCAc3XltQxvrWbfURAnObs8BjEshBYf9bgWBUQ1y54DeGWfMtPPCkgk/3k5ZOARrtdYwgTKbz+fd7jyrLl3Q2mprA0nAzXsdCTfOWE9vBdrSWYQxoJvXWnsNqN8iYYlg/bDvfbyN1GzE4l++T6cWEH43GtAYk/KRP4I+PyyQj2gbwtsUDaSGvshBuwdymg5S8hzDy6sQRuo2EINPIowgykXI/TBbR2msLqaIW8IhRL5DV0cCEwHdcQas5Z/p4g2h+PLud6xqXy72+N6/v1SLUKguGE6ogT3QK1KOj99U0SIoVXsMZRnK4KLLTeaoNKpQ+hL9NxbaEOreHSASpaqywQ6yqipLh+h+PL+vNYzrlTdoQgA+2DeJXhlKDgel86Fq0TAj5fQdYqJiJppspCkVh7dSr86cqpEQHpHzm0afDzItRAjaBoyEolh51kr1aMUEZMsY/OSiCVxQlkJ7osbig+rNwEWbDutPKpjtg+VqHVbK+FlycsqXo0nXPqwLi/ThInQezuptHsby/En65Zh/GkgXOfcgwkU7ccVYXTmk8gb79TDZt+rLqFA7mVa/mMC1Q93SihG/cea2Hq2rdJ8AoT9sGpM7dU1Q/0MYtghaCMac/IWwYUQNxh0j1DPgmAY77OuWTZEAV3WxT6DZ4eg+ywpaEBUp3ql9DaP6RpL2CWF5VtQ7hFfVs9yjRwkpGfukvrcJhfqIkwY0u7CBbdwG9C/tFi2K5AK4LkFfX2u9p0LaCK5+j4vtXOIxwwYRYbhPEKRonlsm1U93sTctE+w2b2xVkNFkcHpVk1XcQK+rcxeHUvDXQ7+rgFsxzjN0Nwk30Fg9TCBwI7DHBy5YXiZ0F00n+rxgDfUMQ15NuHkopjFG3rcYVEvUGJdVHvA/IvSW3C8hH2S5v+TiB1gPSOkFB5NJlWcZ7S+6spN0LH0AT8Mqz7P7+3neBsnNeZzlJbUdFYLDhCqUTZSBS8wF+H4LxPELdkB2DQslYgFsF1scQy3QJAvxVExMuOCCjcL6U2w7VgjQikuzPHdkN79TYJMFxhkUQrNgCfuTLAZXtqNL8rxcoKzdmFB7gK/QzDYK/6RMXPk4yPM4U9Echww2Eqmy+yyhYEKZD/65zyiE5eRyB5MJv+AM5ZTYjLORPN1NZT/x/y/9bnYUsoaANwQ5TbWUnCzPxSK33W5xv7m4J7mWyJDpdLb6+AO1UtJG909iyQAAAABJRU5ErkJggg==",
  bQ:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAA/1BMVEWZmZtycG3Y2NhYWFyWlpiQkZIzMjRfX2FhYGGflomAcls0MzgZGV3v7/IqKiokJC06OkA9PUMAAP9EPUB+foChknTHs4oAAAAlJzE5QkozO0QXGiYdIzIICRATExpISUwzNDhTUlFwZFdmW0////9NRDtGPDUnIRxXV1d/f38jHhtOWmSRhG5YZG2Gd2RlY2VVVVaZmZk2Njupqav///8gHSFoaGiGhoSXl5k2NjZGRUxqaW25vLdDREVpaWxkY2YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABP/Xs5AAAAQHRSTlNX4iKjmymrLWrl/2wEUwbdstEB/IH//wD+/v7+/v3+/v3+/v4E/v7+BQL+//7///7QBdMKL/8HbpUEzZAOaW6upiuNHgAABBlJREFUeNqFVYeWozgQlNOk3b18p0YZEDgxHq99k9P//9VVCxhj7+y7es/mIVTqVOoWMsZtGDWVF1L4FZG1Wmvj8Jd+1hHRhZRb3zRl9SBfhJQxn181td2JJ7JOk/K5z4IxlGVKGaOtdWf3z84WTR6m8jsIy/19sMFbh8ODUiBkrmo2I8JLwPnG2ZWb5/PVdhylBAEYB1fm8AbfFQ4mW13+87fVYAet1a21dRHc+5i3MmEp49bZUBblpqhwJPkbTxRyj8NXVVFUee6dpb+wsbfwKEfsfdDky9oXhQ8qC74sPbYTFpELepPn8oMg5ezJGga+5rwdUCH4nLRBFOT08ywZ6Alf5VtwhpiCUHm7578srRBpu32RCzm0sJcjq9l/g7AVRwsTCF8TE6wet+cfCH/szycIg7TKQ0A2PT9U8IELZ82Xu27fB+G7nE1QB2OUZ0LIb/DIyHtNKDcJeXdEYPdesQ5oHUKggOjxj2DplkKwOUq2iEML4vlX6xzVVQVvkPcEvFBV1eSs3op4sBCjmBDXFcatuw11VYNYAwELlpOhrQsXMbaEhZwFViYqx2hl2iOtQYFOOxrJnnDOsSI4h61ch7YSCdiMdWsUBLbrCMvlbIR8s+pYnMkLAPTkTggZQlLa+iknpxXf+J3YPktCIdj+9L7ebEb/jrB7eeM5Pn/dUYoQetIsqg7JGP12MYvDOrQvU6TKaHsMvqY3/6ZiHdUhLhbyARqAlijJ5wDNhLt4Ig0WxwNbaO9yBxZrS4jy5wTc6S6t/0NYgAB3wnrdV+JAiJ9amHIMpFqCOraw/5GwnAZWjcrWeXYSA43G8ceg5aVlfWfX62wgjHRFrf8GB44J8XExQoGM+ZRA07v9CeEX+YWF8zkBTsmTGBZS7DinqMI6P6hVEbVdw03GXWZbwnKxf3fskBmGzMSQCGSVeDy0meVXROy4PZDKr3M1JChKjYxs/k3eLVu1slZfUwnQ6tfXyULW6iOF0eZWP913FpZy9ky2C+D6eu2zVhnD4qXA3eQ+LqN4kYIcmrPjIoPgex0dOwWRo31M5EI8yqmzvqwIF1plaDDZEbjcfIscVZ7sWYRLU75oVG6aokRbR986AnKxCmW5weTAXHFPF+JMp1uJvpMXV00DWo8iYdM02FwFHpW8TaSejZat0tykFcbNECWGDF/t/g46wVmjQaD6BObjcoR0dYXRaSJwc1fZzzCQu9DJH97cV0udbD3SIiEG3Y4lHjzoXNy7u+bdom1pOD11ECcwY6zTLcu0xk7QfklNzVEp6qIoqzkn3Fn9KUzX/VY1Z1qgaH/64upyg8xXc2DFmHdgN+aBq7IpuLDOirMdJVuh5oleDEr2gVFee+zlOrmdkPF+sqXQmuXFNCV6uDQ0uO87jL7J24v8D+wj+qyraU+9AAAAAElFTkSuQmCC",
  bR:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAA/1BMVEVcXF+loaFkZWigoKP09Pfn5upAPkJWVlygoKMkJCQuLTEgHiU2SEg/Q0ZaWlp/f4OPf38AAAA6QkoWGSY0O0QkKDUdIjIHCBIQEhtCSlIuMzz///9JUlo/Pz9+fn5QW2NVYmtVVVU1NjrJysyoqKhFRkmMi48qKi9JSUw/P39TU1iIiImWlpeVlZknLUA8Oj88O0FoaGhlZGdxcXWGhohFRUhRUVVnZmppaW5ram9lZWqXmJioqKi3t7TLy8vX19cAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB9gvJpAAAAQHRSTlOgEGGeJkRgzVUcv/8O0T6sEAD+/v7+/v7+/f4G/AQE/v8D0UkKz7TTlASwbSi4+2BgBaaOT2BvWZHK/1ApKTQkX55/xgAAA2lJREFUeNqlVVl72yAQxEna9G4lWFiQLMeOXae5r+Zorv//rzoLSJbs5KFf58GfJTHssMegin+E+l/CdBxR4W+z+vs6oXl722kzJDTj7vnb+/dn579vq2beHN+cnZ+f/R513+aZkNnV8dVsOTMhGOP8O7zYJjKC5XJx9JQj5QgvW4vlbEGOAtEpUXBmf348P2Eyp6eGQmD2h4uvBw8pQvN4V/raG3aOSq2t1hr/AO20wJHHJ218GXavq0I1xQlzCNY5x0SsSRhYAYANOE3yrImsSFXj4qdj0K28TEtoBTzptAF5b1zYzwRrIIrAkAWuB85vTA3RNhJ+gQDh1kCzxHXWlz1AIz5gRwNqj2BBQFxmjgSfUZcc37E2BlKRvR4hUFniB/lYoQwQH4w3qAiOFgnIEpSAEBXUXlNfUdDWJ4kd4VexjYRbMmXetIw/Zdk+t09yFv8shWuOgmSU8pfXAKmoIN9XVRVb47h28cBSB1qHVIKlknRS5W6dFh8OUU28ZnYb4LgTf6bvlfSryk14fUMu9Y5s2lY5FVq2qbce0dDdAEmnz9J6naStwV0WaX03cePRTHJlNxGDucNquj6ikYBM+V7hTEgc6w42Z3qWUjvZG+SzI2xGWCRCDcKqIIYy4X49wmihc4TJsGQUD+ZIoWh9wg92KGZIhF6EHILcn51BlqovzBjOEM9gVk2SCQgx2RlGqLQQTEvoGrFMBESo+hGaRunc431CbNakyYWrl6ppCePiGkcgrK8ne32CnKY9hN+fXmQCiNucAmB93ZckyCFgMRedpJ9G3MdKFfa8KYeDEauNbq4/yCnEW0eXFA0F65OiQSFSCPGUcDSdg3BR3GlnQHGW/GTiN6atJHEyNsHpj8UURvZ8CD0wCBvNNI9c6AZOx5cSyPGtSNrZTZMTOxWKsTS0AMEkOxAiS4OoKy9+l8ZEtG4YAMWvmFTk0fFMaZfybExLG4LT2AYTB1ez4ji8oXOisGYaoTWrUvqWrGKbhfRr1cIn24v3mDQJTq+iT9Jq6cr+ejsILzYuaaXzRRMz1/l2nYCFdWuU2XGUZLq9nWyKNUTrTlI85F5J/g11+XgL8MW4GSncg5ooyQ60kVq5s/IJ47asHg5m1Frkpp6E3CJQ9ElJez9tHYQgtXRv6Il3MC0vj9DefwHYa7//rE+d1QAAAABJRU5ErkJggg==",
  bB:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAA/1BMVEWWlpmnqqfe3+BoaGxtbXAgICRkY2WVlJjkx5Vra22liGJgYJ6TjYZqVDt+foGqqsbRrXM/Pz88Oz8/P38oLkAAAP8/QEWJbUbMtpH//wDt8PAAAAA5QkklKDIzOkQWGScdIjIICRETFBsuMztESlByZVd+fn7+/v5XZG0mIRtNUVQkHRhPWmNFOjBXSDlVVVVmZmZoaGtmZ2pnWUlJSU2sq6s7PEFKSk9vamaoqK7X1dcAAFU0NDhVVVpSUldubnEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACL9HTUAAAAQHRSTlNhIR2ZZu3XoP8v/wTh/1UZ/wS5BP8Bxf//AWYA/v7+/v79/v39/gMI///+//7//wMFjqv+zArOtPctMwPNjrVxIM9kEQAAA9BJREFUeNptVYd2qzoQlGuc3NzyepEWVYONDa6p7yb5/796sxIY7HjPSY4RO9o2OwjZtyLnf+KobTT39MKned9F9B82+Ps+CsZRlhntvXb0JIpzSA+A02LwRFqTCkqRyZTKjDM/d69S/nYFgOvFkZzO1otFqQKRYsvIOXofdkFEd//LjqzOysVisQ4MCAnhAfFIrDgH5PL12VpK/uyYImRsXlvaDeXgPII4Ok2ZKtfrUiVA1phSniyNhimrFnAbLPvHOyPAUHxQbSV2mhARgASn8IdL4+A1OYrPzQEZG8Rg0AI28h35mNQXeE1o/vdsdl+Tb0/IYCY3ctsA/pN/WtMBvK1//JjNZnerSWgKJ2Ocu5FfToBHmyJk8bVbVn/d3X2tlp5z5BNjjO0BcrlHH3BL0xWkAANBVHrGG+N0EP/kbZe2cuesxnFKOmu6lPBICCXY8l/5/dTWBzlGDEaQb/raFIyxIVc0yY+GX/JuDmgsEC5CiDxQgMKIEwUfrb8vzgeHh2fLtNGXBvJV5OB3QY1CBLvydXmo6MyqUIfauVEh+xHy4tsUDOPWrOjCViv0CzlhLfJu0vuYDOdv9AUABZF22qKtMu8NDu3h+SNpiuUmw6aygbnEk85Pgxt75xJbsTGpO831KoSgYoyjQPvbGuTLxyPYwkmpoHoWGIsY/um2uNjpYjD+Fcri7IXhxL2Nh42o9Ocg5QgcNpdzINBs3ElNT2a22zcMCYPNTsZzBk9pvM2v6NJWvsU1ysK6LSP6I8IHr84nwGY4YoBXi0WIHOdFixHMePg5QrGRPx0vRQaAOuXEAFaZz0Im5Svx2sUI7SaoLOakLUTmjzNAsXkYZCwcGDiXkDWrmQCY8v3DLw/nEQYsTLHkxbrdtLhtTDCsyr6fUg5yv7vIVq9KlspWjyAhvG/YONoP5fa00ywCOvlDu9u1biUptcqFmybCRt6iP5bixEKjxZ0lBArHStzmBUf4xtmANOaaP39VQBeICvQ1FBzhZYrroxYxW01vGzxLRtxr7l6GeXwUYjBitQDHfOD5Aub7+5aYhVfMcW3dUSAXbmezWT3i9RiIArC/Jv4QqfvUvvrEbh27Fz9EMaIAoX9vvzTtR+pUbvc7DRKTF5YXoNeSPkCp/giTRqOGJC8+vSjDmZWw0EgD89ZZ8XxAfwHSaaDXijZNbfBb1oLCfH6ol8xIZ/V1i1pAq+own88FOkYBv+4OdV2Wy+VytexsFa0q66/sOy/9xIrRI6eE7feVD9P5NXsOVRWaDDzL+Hg/mcSwkHZ3RfB11Crt6bgbFP8DzwwSVj9s51sAAAAASUVORK5CYII=",
  bN:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAA/1BMVEWioqNiYWRRUVSCcFyXl5nj4+MxMTQcGyGKiow/PEE6OkJaWlp7bGRVVap+fYKZiXA0MTQ6O0E/UFdCP0S5udDKyso5QUgAAAA0O0QkKDQWGSYHCREdIjERExwuMjpCS1RPW2X+/v5zZVZJUlklIB09PT1VVVUzMzhXY2xFRUh/f39nWEaHh4okHRtnZmiGhokkJixMQjpGRUp1dHdDPTRZWlx1dXiuq6s/P39FRUpJSU5TVFloaGtlZWd5d3lzc3YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADK/yzQAAAAQHRSTlMuomX+Xh2t0LJh3Qf/A27/Yrz/ZAtN/gD+/v7+/v79/f4F/v7+BAPU/tAC/lL/ZWnM/rNT/5VjDQRwlMxMlTm73KILhQAAA9lJREFUeNqVVed62zgQhCy35HLJVRCLsiRFq1DdLe7O+7/VzS5JSZbl5Lv5YVLGDmY7TfY/YT48KUfD++G0/DVhNBzu/hwC9+UHhHLUvQher5fL7z9TmDaP+R8P9RjglJj81ae/Px0tTXe4Q5DLzXVvfMZEzjlKgfKcQiTixPN3BDF/vmJilwPOxZCsPtjaytM8++0N4Xd4fXRKLq+sc+x9CCFWNrKNePMx0EruLHcUyqMx50VhKUZYJx9SVTgQKHifhFRfw/yuIcC7+Zhg7ohw6iGUR7LQEuQKF6metwqjrHzwVFUwjylFV02KynbmgMVVgI30dFxORcE8JWqd8a6YFLlt0RI6CifqZfeZOamTncAe3pCt9PYtJLuIgHEAkfAkLuXBTSoXYwrR4p9vzDtGwhu0mWo4RGkCh8iH6GAPF1pvthxm1t9FkTP9aZLUCfEGkvsbv7XWm7g3EcGxnI2vckLPwFEktkVCbhuyajRKql5MWgIicFXeEbxUY3szu1ZB6mIiIlACb1LvIAgRhiUCQH0ibQ5ZYmAheHRCm3crDOkQRUjy0oRlLQjoGJLked4EiMxoYRT16frsDCRkUkIzMVjtiqCBbmugrkRK6Vya8/vYJx9Fy1ylKAzEGZ19WzcWig+fZU7L1SklD4bJrlBHdSrSHkNSAx3v6+UJKF9vb297K5P9m6dOgvbtbYFUo0refe22gbkbHTsvEpL8fYY0qlCip3z+T4b9M5IBmnOkuJV46xjmQzwD5VwH28iq+hHgKqJI76OAiDIcBbeS4TeyvM4DsUik91FIN0gXW/QLLeEOFMprDtwQPFl7WMMKY6xBr+oUsIGaPPEhggyP9EvwL2VmHmU0nYaA0N1Bgp0U8Il9YCgcUSAtg2T1I0JltX/EJ5Md1163Feylkd0hDqy1GXJNa/n6UJMsh4Yi69ftopkI+EAv2H9G93BZXgXtZmn9KKAY26fMRMJhCnyCBWuaz8h8jSI0e1QHJm0RmouIQuqZdhmbnmxdnSvR7qxwKV69etkMH72cmLK8WzmNuFHXSHbQ/lNIsnxzM50+c2jy0/R/ayKzo+GQJkHmPEo3mGH27BN1mdk00Gbxbfcyi2AwpXkMUJD78/bQ7u3vDjo0JpPeDhqZLiz7VwXkW9h2e4qP+LAKgfuDpnDqsttHUxD58qWbwaXJkNKLqt+fXUIIifQHICleLC5ngwHDpQw7JySeDfrfZgAtLhSLRftysbgZzGb9b4PBJW4ko9/QGhnGgDJffvkyeI+Kb24Ym8x/fjyWmQbFLMdriSNo46T2T/fQqq/Xt6/YNf8Bj5buGsWbHyUAAAAASUVORK5CYII=",
  bP:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAA/1BMVEVoaGshICWZmZzk2OKbmp6Tk5dsa3CrrKwkJDY9PT89PEEAAP8/QEJAP0NfX2ZSUFV/f4R+foJ/f4OAf4L/AP/IyLYAAAAyOkQjKDU6QkoXGicHCBAQEhscIjBCS1YuMzz+//5/f39JUlxbZ3JOWWJVVVUYGB0aGyA/Pz+qqqopKS4yMjdJR0xXVlplZWWXl5f4+vhIR01EREiEhIW6urrn5+ktKi4oJysoLUA9PkFISE1qaG9ra3Fra25janB3d3cAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7EucKAAAAQHRSTlOdj5IbV9ZzOQ580wHY9CjHNpn//wEOAP7+/v7+/f79/AcC/P/+A6+tBAbbzKmVCjEtNtFREiSItf+zazRVe/9U8IUB2gAAAsFJREFUeNrtVGdz2zAMpUeS7l0SJLgkW2m8svf8//+qAEUrkqzrXb/2+nJ2LBGPWA8Q8i8h/hP+DUJRFFXrsaLnPxA6tq3XcZiQrro6exCHvxiHhJvxwwlbH73fJRRHUp4+rr01xkCGsWDBC+YUfcJCypNNIOugfVmWXmvtvdcqOGvhnZj0PSzkqbB0pMrZbPZMnzlTtGIEg3b5NcrYIhRx7AHBKzWfZZRbe6UVWAybjodC7iFCOtVlmUJS+hXg6LRPsGhUE4VqmdNPMIjLAQ8A7WsbkqKDHQ9xHAAdU9octg700lmE9W6VAhoHTIKQ4+K76QVV6fOFPN7p9DQgIrWNOY5A3/RkLGLYu+r3IT6OlkCNoFOC3YIfDP03dnn/pe42Eyp5tiI9qJQeRfCKFGCKjRydTxrCj7MkCuUZ3aTLOUErCs6WsQmpiFf7d0D9tHyhJzH5DJ1cIlj1NI1VN+nJZP864BDOry8msZc0i5tS/57K1AG14DLNXtUva3Ep4zciUD2bNtBviufNtgc9wuJyOkeuViMlmgZO7OlYHvdCihWHNFbIw+bnJSuOaURwBo1IY1o1hMSOp2Ob7PW8NQsBOCj8cBG3U589TDcrGqxUVJo2ctBOg52YO3GQPVTFJ3EOXL6k76597r5hiYT1y6KK7OHeGB5cuiZwY8uewEkrJC8IDp8je4j7h2k8qf/Q6GeLpFfWO/MQNgdRrD9am4VWa0mFjJQ0vdMskFrp1qwEYt5bfD99oAseDHbiascGhWHTulV5xnrIO6E+uQVBN4RcFT0M1YYTSTvDh72N49NGEFTMNL81qxmEFvJNt8DZWGEMZk1zfkMe6mabZIhOKPZk8qiYQaS1gNZRO7ymkFLTdD2Nza5orQ6eW6hzoMqLFaSG1BUcTFrV289Y/gMhD15Go5u8j3aicXlMGWE0envy8zeLPuFA9wf07wAAAABJRU5ErkJggg==",
  wK:"data:image/png;base64,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",
  wQ:"data:image/png;base64,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",
  wR:"data:image/png;base64,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",
  wB:"data:image/png;base64,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",
  wN:"data:image/png;base64,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",
  wP:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAA/1BMVEWmpqajoZvn4tFaWluqp57Y1ceXlZDu7eQqKixVU1JiYmPNy8RdXl6KhXY/Pz82NDQ8PEHBvbHPyruBfnrNyLsdHCDBuqo8OkA6PUIAAP9CQD9VVar//7/Z0r0AAAC2tKysqqPd18NpaWjg2cT9/f3i28c4NzcoKCnb1saXl5JISEfOyrvKxrh4d3RXVlQWFhgGBgeKiYfHxLXi3Mrq5NBqZVanpZt/f3/s59Tr5dK4tayGhHXCu6zr59WPi4OnpJkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADYb832AAAAQHRSTlMf3Vqep65pK9vabOAM3QSm55Vp/ZZr63qlAa0DBOwA+vfw/fAK0fr60fv71PD9+fz9/bOxzfr5A5Gwy6b2btOMZSeOQQAAA39JREFUeNrtVGl34jgQlHyAzZ1jZo+ZRUIYSbZlycaxwaxJ/v+/mpaAEJLMmzefd4vnA6nLrVZ1CS1/E+h/wn+YkFzxS0Kym81uBmYzlPycsHufIHk7/p7gRpPJaB7xK2J/5DKgj4QJRA/mQmRxQSmxwDiYxpqLyLdByYcMyOeGP5CjNwR4+yeLLnzKsRYmHrzPkCBPl6Iar+vLhFdLKVer1aZ7UkyI5+G5IHRef8BNQSGiHsLM92QI8RvLWK9XslaVEPFNht0SG5OqsN4AZFjXcm0jXQoZhiTlZfSRUJFe1hsXtFrDz0HKbqxo+wlBlIwS2sPXIcl6bW+2AhnmsGGVMLeE5Q4NsoinbjvzUOYOKleEwBanWSl8tLsh2H4ITJkVqdOAWhCrB00LbUw2fNX7okMy8mPOBUCzqqrSEwrQjUeCL86Cnwk7EC3LtB8ciCIQlb1CVylV/SHwgRkFyYUwWQ4yU5Ah7L7nHfd570ohfd+rI4x4MJFXoiyS65IQ8iOeseI5eAke9/v9Ea59B1cYBC+4aJjgsCh000vJaBQLW0XGGnZC02imbVk2+l0vnZ0wKsuMxewtFqU41Tu53SVwAmztlxL0JvKCECphJYfI2eSjgZLdcvhHaYqWgMBWaQDBFAiw+KtP0bm73T2GBKmSrpc2tv1Wqk1ZKUYXi91m8KOSV5TI49G10enKKWbGzE8ZdsmFMBz4sTCGkRz85nWuTyEB9GCdfyVVZkw0/3LO8BfI5gsGfivI+Hi0StmmvnBWaxlKRWE65pE/nH2zGUamrEjDofOCTV2Dk7vOGRoeG6VySaEx+MOYO61RMvgzioRO+3baNHEDmE6fASlc02nROExT2j5wI6zcIrI9XRXFtO1JDx8Mpv9eEWz/Uf1XRTAE2LYUAokCul7BBpIWY9wC6FvY/ynGh/twn4NBUo3AJcrWN7bLrsPQWQ1gbyfjyW4PxVjLKvgCAks6UWt7Djk7r51k7nH6v1nBC1i968IDQbAitd3ee84K9SvDqWB59mPQ6N79/ePdgdAKLbiunI8PFsHd4/YWd3eBnXAFVSzjaIyLOM4apou2dScAPZ/FV7SYpoxprjOdEsQwGY/ByUz781izz6Dnf89jnLYQRwskrMfs6aLCMMQBDgYnvJwAb0EQbsc5nDeQxICbRn4U8dJwe0bQT4GZ1hnELhaxP/gBVVIjwXtON1AAAAAASUVORK5CYII=",
};
function makePiece(t, w, overrideColor) {
  // Use real pixel-art piece images from PIECE_IMGS
  const key=(w?'w':'b')+t;
  if(PIECE_IMGS[key]&&!overrideColor){
    return `<img src="${PIECE_IMGS[key]}" style="width:50%;height:50%;display:block;image-rendering:pixelated;object-fit:contain;" draggable="false">`;
  }
  // Tinted version for Don (orange) - use canvas overlay via filter or just use image with tint wrapper
  if(PIECE_IMGS[key]&&overrideColor){
    return `<div style="position:relative;width:100%;height:100%;"><img src="${PIECE_IMGS[key]}" style="width:50%;height:50%;display:block;image-rendering:pixelated;object-fit:contain;filter:sepia(1) saturate(4) hue-rotate(340deg) brightness(1.1);" draggable="false"></div>`;
  }
  // Fallback pixel-art style pieces
  const ol='#111';
  const f  = overrideColor ? overrideColor       : (w ? '#f0ede0' : '#2a2a2a');
  const hi = overrideColor ? '#ffb060'           : (w ? '#ffffff' : '#555555');
  const sh = overrideColor ? '#7a3000'           : (w ? '#b0aa98' : '#111111');
  const md = overrideColor ? '#cc6820'           : (w ? '#d8d4c4' : '#3a3a3a');
  const ac = overrideColor ? '#ffcc44'           : (w ? '#c8b860' : '#888855'); // accent/gold

  if(t==='W'){
    return `<svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <rect x="4" y="8" width="92" height="74" fill="#b85c2a" stroke="${ol}" stroke-width="2"/>
      <rect x="4" y="8" width="92" height="16" fill="#d4703a" stroke="${ol}" stroke-width="1"/>
      <rect x="4" y="28" width="92" height="16" fill="#b85c2a" stroke="${ol}" stroke-width="1"/>
      <rect x="4" y="48" width="92" height="16" fill="#d4703a" stroke="${ol}" stroke-width="1"/>
      <rect x="4" y="68" width="92" height="14" fill="#b85c2a" stroke="${ol}" stroke-width="1"/>
      <line x1="28" y1="8" x2="28" y2="24" stroke="${ol}" stroke-width="2"/>
      <line x1="54" y1="8" x2="54" y2="24" stroke="${ol}" stroke-width="2"/>
      <line x1="78" y1="8" x2="78" y2="24" stroke="${ol}" stroke-width="2"/>
      <line x1="16" y1="28" x2="16" y2="44" stroke="${ol}" stroke-width="2"/>
      <line x1="42" y1="28" x2="42" y2="44" stroke="${ol}" stroke-width="2"/>
      <line x1="68" y1="28" x2="68" y2="44" stroke="${ol}" stroke-width="2"/>
      <line x1="28" y1="48" x2="28" y2="64" stroke="${ol}" stroke-width="2"/>
      <line x1="54" y1="48" x2="54" y2="64" stroke="${ol}" stroke-width="2"/>
      <line x1="78" y1="48" x2="78" y2="64" stroke="${ol}" stroke-width="2"/>
      <line x1="16" y1="68" x2="16" y2="82" stroke="${ol}" stroke-width="2"/>
      <line x1="42" y1="68" x2="42" y2="82" stroke="${ol}" stroke-width="2"/>
      <line x1="68" y1="68" x2="68" y2="82" stroke="${ol}" stroke-width="2"/>
    </svg>`;
  }

  const pieces={
    P:`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- base -->
      <rect x="22" y="82" width="56" height="10" fill="${sh}" stroke="${ol}" stroke-width="2"/>
      <rect x="24" y="80" width="52" height="6"  fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="26" y="76" width="48" height="6"  fill="${hi}" stroke="${ol}" stroke-width="2"/>
      <!-- stem -->
      <rect x="34" y="60" width="32" height="18" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="36" y="62" width="10" height="4"  fill="${hi}" stroke="none"/>
      <!-- collar -->
      <rect x="30" y="54" width="40" height="8"  fill="${md}" stroke="${ol}" stroke-width="2"/>
      <!-- head -->
      <rect x="34" y="30" width="32" height="26" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="36" y="32" width="12" height="6"  fill="${hi}" stroke="none"/>
      <rect x="34" y="52" width="32" height="4"  fill="${sh}" stroke="${ol}" stroke-width="2"/>
      <!-- top cap -->
      <rect x="38" y="22" width="24" height="10" fill="${md}" stroke="${ol}" stroke-width="2"/>
      <rect x="40" y="24" width="8"  height="4"  fill="${hi}" stroke="none"/>
      <!-- topmost dome -->
      <rect x="42" y="16" width="16" height="8"  fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="44" y="18" width="6"  height="3"  fill="${hi}" stroke="none"/>
    </svg>`,

    R:`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- base -->
      <rect x="18" y="84" width="64" height="10" fill="${sh}" stroke="${ol}" stroke-width="2"/>
      <rect x="20" y="80" width="60" height="6"  fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="22" y="74" width="56" height="8"  fill="${hi}" stroke="${ol}" stroke-width="2"/>
      <!-- column -->
      <rect x="28" y="50" width="44" height="26" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="30" y="52" width="14" height="6"  fill="${hi}" stroke="none"/>
      <!-- parapet base -->
      <rect x="24" y="42" width="52" height="10" fill="${md}" stroke="${ol}" stroke-width="2"/>
      <!-- battlements -->
      <rect x="24" y="28" width="12" height="16" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="26" y="30" width="5"  height="6"  fill="${hi}" stroke="none"/>
      <rect x="44" y="28" width="12" height="16" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="46" y="30" width="5"  height="6"  fill="${hi}" stroke="none"/>
      <rect x="64" y="28" width="12" height="16" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="66" y="30" width="5"  height="6"  fill="${hi}" stroke="none"/>
      <!-- gap fills (dark slots between merlons) -->
      <rect x="36" y="36" width="8"  height="8"  fill="${sh}" stroke="${ol}" stroke-width="2"/>
      <rect x="56" y="36" width="8"  height="8"  fill="${sh}" stroke="${ol}" stroke-width="2"/>
    </svg>`,

    N:`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- base -->
      <rect x="20" y="84" width="60" height="10" fill="${sh}" stroke="${ol}" stroke-width="2"/>
      <rect x="22" y="80" width="56" height="6"  fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="24" y="74" width="52" height="8"  fill="${hi}" stroke="${ol}" stroke-width="2"/>
      <!-- body/neck -->
      <rect x="28" y="50" width="36" height="26" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="30" y="52" width="12" height="6"  fill="${hi}" stroke="none"/>
      <!-- chest -->
      <rect x="26" y="40" width="40" height="12" fill="${md}" stroke="${ol}" stroke-width="2"/>
      <!-- head -->
      <rect x="36" y="22" width="36" height="20" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="38" y="24" width="12" height="6"  fill="${hi}" stroke="none"/>
      <!-- snout -->
      <rect x="54" y="36" width="18" height="10" fill="${md}" stroke="${ol}" stroke-width="2"/>
      <rect x="56" y="38" width="6"  height="4"  fill="${hi}" stroke="none"/>
      <!-- nostril -->
      <rect x="66" y="40" width="4"  height="4"  fill="${sh}" stroke="${ol}" stroke-width="1"/>
      <!-- ear -->
      <rect x="38" y="14" width="10" height="10" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="40" y="16" width="4"  height="4"  fill="${hi}" stroke="none"/>
      <!-- mane detail -->
      <rect x="36" y="40" width="6"  height="16" fill="${sh}" stroke="${ol}" stroke-width="1"/>
      <!-- eye -->
      <rect x="60" y="26" width="6"  height="6"  fill="${sh}" stroke="${ol}" stroke-width="2"/>
      <rect x="62" y="28" width="2"  height="2"  fill="${ol}" stroke="none"/>
    </svg>`,

    B:`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- base -->
      <rect x="20" y="84" width="60" height="10" fill="${sh}" stroke="${ol}" stroke-width="2"/>
      <rect x="22" y="80" width="56" height="6"  fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="24" y="74" width="52" height="8"  fill="${hi}" stroke="${ol}" stroke-width="2"/>
      <!-- lower body -->
      <rect x="28" y="56" width="44" height="20" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="30" y="58" width="14" height="6"  fill="${hi}" stroke="none"/>
      <!-- band -->
      <rect x="26" y="50" width="48" height="8"  fill="${md}" stroke="${ol}" stroke-width="2"/>
      <!-- mitre body -->
      <rect x="32" y="30" width="36" height="22" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="34" y="32" width="12" height="8"  fill="${hi}" stroke="none"/>
      <!-- vertical seam -->
      <rect x="48" y="30" width="4"  height="22" fill="${sh}" stroke="${ol}" stroke-width="1"/>
      <!-- mitre top left -->
      <rect x="34" y="18" width="14" height="14" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="36" y="20" width="6"  height="6"  fill="${hi}" stroke="none"/>
      <!-- mitre top right -->
      <rect x="52" y="18" width="14" height="14" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="54" y="20" width="6"  height="6"  fill="${hi}" stroke="none"/>
      <!-- orb -->
      <rect x="44" y="12" width="12" height="8"  fill="${ac}" stroke="${ol}" stroke-width="2"/>
      <rect x="46" y="14" width="4"  height="3"  fill="${hi}" stroke="none"/>
    </svg>`,

    Q:`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- base -->
      <rect x="18" y="84" width="64" height="10" fill="${sh}" stroke="${ol}" stroke-width="2"/>
      <rect x="20" y="80" width="60" height="6"  fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="22" y="74" width="56" height="8"  fill="${hi}" stroke="${ol}" stroke-width="2"/>
      <!-- lower body -->
      <rect x="26" y="56" width="48" height="20" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="28" y="58" width="16" height="6"  fill="${hi}" stroke="none"/>
      <!-- waist band -->
      <rect x="24" y="50" width="52" height="8"  fill="${md}" stroke="${ol}" stroke-width="2"/>
      <!-- upper body -->
      <rect x="28" y="38" width="44" height="14" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="30" y="40" width="14" height="6"  fill="${hi}" stroke="none"/>
      <!-- crown base -->
      <rect x="22" y="30" width="56" height="10" fill="${md}" stroke="${ol}" stroke-width="2"/>
      <!-- crown points - 5 orbs -->
      <rect x="22" y="18" width="8"  height="14" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="36" y="14" width="8"  height="18" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="50" y="12" width="8"  height="20" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="64" y="14" width="8"  height="18" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="78" y="18" width="8"  height="14" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <!-- orb tops -->
      <rect x="23" y="14" width="6"  height="6"  fill="${ac}" stroke="${ol}" stroke-width="2"/>
      <rect x="37" y="10" width="6"  height="6"  fill="${ac}" stroke="${ol}" stroke-width="2"/>
      <rect x="51" y="8"  width="6"  height="6"  fill="${ac}" stroke="${ol}" stroke-width="2"/>
      <rect x="65" y="10" width="6"  height="6"  fill="${ac}" stroke="${ol}" stroke-width="2"/>
      <rect x="79" y="14" width="6"  height="6"  fill="${ac}" stroke="${ol}" stroke-width="2"/>
    </svg>`,

    K:`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- base -->
      <rect x="18" y="84" width="64" height="10" fill="${sh}" stroke="${ol}" stroke-width="2"/>
      <rect x="20" y="80" width="60" height="6"  fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="22" y="74" width="56" height="8"  fill="${hi}" stroke="${ol}" stroke-width="2"/>
      <!-- lower body -->
      <rect x="26" y="54" width="48" height="22" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="28" y="56" width="16" height="8"  fill="${hi}" stroke="none"/>
      <!-- waist -->
      <rect x="24" y="48" width="52" height="8"  fill="${md}" stroke="${ol}" stroke-width="2"/>
      <!-- upper body -->
      <rect x="28" y="36" width="44" height="14" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="30" y="38" width="14" height="6"  fill="${hi}" stroke="none"/>
      <!-- crown base -->
      <rect x="24" y="28" width="52" height="10" fill="${md}" stroke="${ol}" stroke-width="2"/>
      <!-- crown battlements -->
      <rect x="24" y="16" width="14" height="14" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="26" y="18" width="6"  height="6"  fill="${hi}" stroke="none"/>
      <rect x="44" y="16" width="14" height="14" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="46" y="18" width="6"  height="6"  fill="${hi}" stroke="none"/>
      <rect x="64" y="16" width="14" height="14" fill="${f}"  stroke="${ol}" stroke-width="2"/>
      <rect x="66" y="18" width="6"  height="6"  fill="${hi}" stroke="none"/>
      <!-- cross -->
      <rect x="46" y="4"  width="8"  height="24" fill="${ac}" stroke="${ol}" stroke-width="2"/>
      <rect x="38" y="10" width="24" height="8"  fill="${ac}" stroke="${ol}" stroke-width="2"/>
      <rect x="48" y="6"  width="4"  height="4"  fill="${hi}" stroke="none"/>
    </svg>`
  };
  return pieces[t] || `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>`;
}

function initBoard(){
  return[
    ['bR','bN','bB','bQ','bK','bB','bN','bR'],
    ['bP','bP','bP','bP','bP','bP','bP','bP'],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    ['wP','wP','wP','wP','wP','wP','wP','wP'],
    ['wR','wN','wB','wQ','wK','wB','wN','wR']
  ];
}

let board,turn,selected,history,castleRights,enPassant,gameOver,highlightMoves,blockedMoves;
let sqSize=60;
let steveModeActive=false;
let drunkModeActive=false;

// Move history log
let moveLog = []; // array of {white: "e4", black: "e5"} pairs
// Teacher AI tracking
let teacherLog = []; // {color, san, eval: 'good'|'ok'|'bad', scoreDelta}
let teacherEnabled = true;

function color(p){return p?p[0]:null;}
function type(p){
  if(!p) return null;
  if(p==='bC') return 'C';
  if(p==='bCK') return 'CK';
  return p[1];
}
function opponent(c){return c==='w'?'b':'w';}
function inBounds(r,c){return r>=0&&r<8&&c>=0&&c<8;}

// Piece glyphs for notation
const PIECE_GLYPHS = {K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'',wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞'};

function toAlgebraic(sr,sc,nr,nc,piece,isCapture,promo,checkStr){
  const files='abcdefgh';
  const t=type(piece);
  if(t==='K'&&Math.abs(nc-sc)===2){
    return nc>sc?'O-O':'O-O-O';
  }
  let notation='';
  if(t!=='P'){
    notation+=t;
  }
  // Disambiguation: for simplicity just use file if pawn capture
  if(t==='P'&&isCapture){
    notation+=files[sc];
  }
  if(isCapture) notation+='x';
  notation+=files[nc]+(8-nr);
  if(promo) notation+='='+promo;
  notation+=checkStr;
  return notation;
}

function recordMove(sr,sc,nr,nc,piece,capturedPiece,promoType,newBoard){
  const isCapture=!!capturedPiece;
  const oppColor=opponent(color(piece));
  const inCh=isInCheck(newBoard,oppColor);
  const hasMoves=allLegalMoves(newBoard,oppColor,null,castleRights).length>0;
  const checkStr=inCh?(hasMoves?'+':'#'):'';
  const promo=promoType||false;
  const san=toAlgebraic(sr,sc,nr,nc,piece,isCapture,promo,checkStr);

  // Teacher AI: evaluate move quality
  if(teacherEnabled){
    const scoreBefore=evalBoard(board);
    const scoreAfter=evalBoard(newBoard);
    const col=color(piece);
    const delta=col==='w'?(scoreAfter-scoreBefore):(scoreBefore-scoreAfter);
    let qual='ok';
    if(delta>150) qual='good';
    else if(delta<-80) qual='bad';
    teacherLog.push({color:col,san,eval:qual,scoreDelta:delta});
    updateEvalBar(scoreAfter);
  }

  if(color(piece)==='w'){
    moveLog.push({white:san,black:null});
  } else {
    if(moveLog.length&&moveLog[moveLog.length-1].black===null){
      moveLog[moveLog.length-1].black=san;
    } else {
      moveLog.push({white:'…',black:san});
    }
  }
  renderMoveHistory();
}

function renderMoveHistory(){
  const list=document.getElementById('move-list');
  const footer=document.getElementById('move-history-footer');
  if(!moveLog.length){
    list.innerHTML='';
    footer.textContent='—';
    return;
  }

  let html='';
  moveLog.forEach((pair,i)=>{
    const isLastRow=i===moveLog.length-1;
    const wLatest=isLastRow&&pair.black===null;
    const bLatest=isLastRow&&pair.black!==null;
    html+=`<div class="move-row">
      <div class="move-num">${i+1}</div>
      <div class="move-cell white-cell${wLatest?' latest':''}">${pair.white||''}</div>
      <div class="move-cell black-cell${bLatest?' latest':''}">${pair.black||''}</div>
    </div>`;
  });
  list.innerHTML=html;

  // Auto-scroll to bottom
  list.scrollTop=list.scrollHeight;

  // Count total half-moves
  let total=0;
  moveLog.forEach(p=>{if(p.white&&p.white!=='…')total++;if(p.black)total++;});
  footer.textContent=total+' move'+(total!==1?'s':'');
}

function isWall(b,r,c){return b[r]&&b[r][c]&&type(b[r][c])==='W';}
function crossesWall(sr,nr){
  // Wall sits between rows 3 and 4 (between ranks 5 and 4)
  // Block any move that crosses from <=3 to >=4 or vice versa
  if(!isDonActive())return false;
  return (sr<=3&&nr>=4)||(sr>=4&&nr<=3);
}

function rawMoves(b,r,c,ep){
  const p=b[r][c];if(!p)return[];
  if(type(p)==='W')return[];
  // Checker pieces don't participate in chess move generation
  if(p==='bC'||p==='bCK')return[];
  const col=color(p),t=type(p),moves=[];
  const add=(nr,nc,promo)=>{if(inBounds(nr,nc))moves.push([nr,nc,promo||false]);};
  if(t==='P'){
    const dir=col==='w'?-1:1,start=col==='w'?6:1;
    if(inBounds(r+dir,c)&&!b[r+dir][c]){
      if(r+dir===0||r+dir===7)['Q','R','B','N'].forEach(q=>add(r+dir,c,q));
      else add(r+dir,c);
      if(r===start&&!b[r+2*dir][c])add(r+2*dir,c);
    }
    [-1,1].forEach(dc=>{
      if(inBounds(r+dir,c+dc)){
        if(b[r+dir][c+dc]&&color(b[r+dir][c+dc])!==col){
          if(r+dir===0||r+dir===7)['Q','R','B','N'].forEach(q=>add(r+dir,c+dc,q));
          else add(r+dir,c+dc);
        }
        if(ep&&ep[0]===r+dir&&ep[1]===c+dc)add(r+dir,c+dc);
      }
    });
  } else if(t==='N'){
    [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc])=>{
      const nr=r+dr,nc=c+dc;if(inBounds(nr,nc)&&color(b[nr][nc])!==col)add(nr,nc);
    });
  } else if(t==='K'){
    [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc])=>{
      const nr=r+dr,nc=c+dc;if(inBounds(nr,nc)&&color(b[nr][nc])!==col)add(nr,nc);
    });
  } else {
    const dirs=t==='R'?[[0,1],[0,-1],[1,0],[-1,0]]:t==='B'?[[1,1],[1,-1],[-1,1],[-1,-1]]:[[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
    dirs.forEach(([dr,dc])=>{
      let nr=r+dr,nc=c+dc;
      while(inBounds(nr,nc)){if(b[nr][nc]){if(color(b[nr][nc])!==col)add(nr,nc);break;}add(nr,nc);nr+=dr;nc+=dc;}
    });
  }
  return moves;
}

function isAttacked(b,r,c,byColor){
  for(let i=0;i<8;i++)for(let j=0;j<8;j++)
    if(color(b[i][j])===byColor&&rawMoves(b,i,j,null).some(([nr,nc])=>nr===r&&nc===c))return true;
  return false;
}
function findKing(b,col){for(let i=0;i<8;i++)for(let j=0;j<8;j++)if(b[i][j]===col+'K')return[i,j];return null;}

function applyMove(b,r,c,nr,nc,promo,ep){
  const nb=b.map(row=>[...row]);const p=nb[r][c],t=type(p),col=color(p);let newEp=null;
  if(t==='P'&&ep&&nr===ep[0]&&nc===ep[1])nb[r][nc]=null;
  if(t==='K'&&Math.abs(nc-c)===2){if(nc>c){nb[nr][5]=nb[nr][7];nb[nr][7]=null;}else{nb[nr][3]=nb[nr][0];nb[nr][0]=null;}}
  nb[nr][nc]=promo?col+promo:p;nb[r][c]=null;
  if(t==='P'&&Math.abs(nr-r)===2)newEp=[r+(nr-r)/2,c];
  return[nb,newEp];
}

function legalMoves(b,r,c,ep,cr){
  const p=b[r][c];if(!p)return[];
  const col=color(p),t=type(p),opp=opponent(col);
  let moves=rawMoves(b,r,c,ep);
  if(t==='K'){
    const row=col==='w'?7:0;
    if(r===row&&c===4){
      if(cr[col].k&&!b[row][5]&&!b[row][6]&&!isAttacked(b,row,4,opp)&&!isAttacked(b,row,5,opp)&&!isAttacked(b,row,6,opp))moves.push([row,6,false]);
      if(cr[col].q&&!b[row][3]&&!b[row][2]&&!b[row][1]&&!isAttacked(b,row,4,opp)&&!isAttacked(b,row,3,opp)&&!isAttacked(b,row,2,opp))moves.push([row,2,false]);
    }
  }
  return moves.filter(([nr,nc,promo])=>{
    const[nb]=applyMove(b,r,c,nr,nc,promo,ep);const[kr,kc]=findKing(nb,col);return!isAttacked(nb,kr,kc,opp);
  });
}

function allLegalMoves(b,col,ep,cr){
  const moves=[];
  for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(color(b[r][c])===col)legalMoves(b,r,c,ep,cr).forEach(m=>moves.push([r,c,...m]));
  return moves;
}
function isInCheck(b,col){const kp=findKing(b,col);if(!kp)return false;const[kr,kc]=kp;return isAttacked(b,kr,kc,opponent(col));}

let pieceEls={};

function isDonActive(){
  if(botIdx>=0&&BOTS[botIdx]&&(BOTS[botIdx].isTrump||BOTS[botIdx].name.includes('The Don')))return true;
  if(whiteBotIdx>=0&&BOTS[whiteBotIdx]&&(BOTS[whiteBotIdx].isTrump||BOTS[whiteBotIdx].name.includes('The Don')))return true;
  try{if(fp&&fp.botIdxs&&fp.botIdxs.some(idx=>idx!=null&&BOTS[idx]&&(BOTS[idx].isTrump||BOTS[idx].name.includes('The Don'))))return true;}catch(e){}
  return false;
}

function buildPieceEl(p, r, c){
  const div=document.createElement('div');
  div.className='piece';
  div.dataset.p=p;
  // Checkers piece rendering
  if(p==='bC'||p==='bCK'){
    const isKing=p==='bCK';
    div.innerHTML=`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="70" rx="38" ry="10" fill="rgba(0,0,0,0.25)"/>
      <circle cx="50" cy="48" r="36" fill="#cc2200" stroke="#1a1a1a" stroke-width="3"/>
      <circle cx="50" cy="48" r="28" fill="#ff3300" stroke="#1a1a1a" stroke-width="2"/>
      <circle cx="50" cy="48" r="20" fill="#cc2200" stroke="#1a1a1a" stroke-width="1.5"/>
      <ellipse cx="42" cy="40" rx="8" ry="5" fill="rgba(255,255,255,0.25)" stroke="none"/>
      ${isKing?'<text x="50" y="55" font-size="28" text-anchor="middle" fill="#ffdd00" font-weight="bold" font-family="serif">♛</text>':''}
    </svg>`;
    div.style.width=sqSize+'px'; div.style.height=sqSize+'px';
    div.style.left=(c*sqSize)+'px'; div.style.top=(r*sqSize)+'px';
    return div;
  }
  const isWallPiece=type(p)==='W';
  // Only orange Don's own pieces (the bot's side), not all pieces on board
  const donSide=(botIdx>=0&&BOTS[botIdx]&&(BOTS[botIdx].isTrump||BOTS[botIdx].name.includes('The Don')))?'b':(whiteBotIdx>=0&&BOTS[whiteBotIdx]&&(BOTS[whiteBotIdx].isTrump||BOTS[whiteBotIdx].name.includes('The Don')))?'w':null;
  const overrideColor=(!isWallPiece && donSide && color(p)===donSide) ? '#ff6a00' : null;
  div.innerHTML=makePiece(type(p),color(p)==='w', overrideColor);
  div.style.width=sqSize+'px';
  div.style.height=sqSize+'px';
  div.style.left=(c*sqSize)+'px';
  div.style.top=(r*sqSize)+'px';
  return div;
}

function rebuildPieces(){
  const layer=document.getElementById('piece-layer');
  layer.innerHTML='';
  pieceEls={};
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){
    const p=board[r][c];if(!p)continue;
    const el=buildPieceEl(p,r,c);
    layer.appendChild(el);
    pieceEls[r+','+c]=el;
  }
}

function shouldBotMove(){
  if(gameOver) return false;
  if(turn==='b' && botIdx>=0) return true;
  if(turn==='w' && whiteBotIdx>=0) return true;
  return false;
}

function animateAndCommit(sr,sc,nr,nc,promo,isBot,afterFn){
  // Clear previous bot chat — new move incoming
  ['white-speech-row','black-speech-row'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('visible');});
  const finalPromo=promo||(type(board[sr][sc])==='P'&&(nr===0||nr===7)?'Q':false);
  const isEP=type(board[sr][sc])==='P'&&enPassant&&nr===enPassant[0]&&nc===enPassant[1];
  const capR=isEP?sr:nr, capC=isEP?nc:nc;
  const capKey=capR+','+capC;
  const capEl=pieceEls[capKey];
  const movingPiece=board[sr][sc];
  const capturedPiece=board[capR][capC];

  if(capEl && board[capR][capC] && color(board[capR][capC])!==color(board[sr][sc])){
    capEl.classList.add('capturing');
    capEl.addEventListener('animationend',()=>capEl.remove(),{once:true});
    delete pieceEls[capKey];
  }
  const movEl=pieceEls[sr+','+sc];
  if(movEl){
    movEl.classList.add('moving');
    movEl.style.left=(nc*sqSize)+'px';
    movEl.style.top=(nr*sqSize)+'px';
    delete pieceEls[sr+','+sc];
    pieceEls[nr+','+nc]=movEl;
    movEl.addEventListener('transitionend',()=>{
      movEl.classList.remove('moving');
      finish();
    },{once:true});
    setTimeout(finish, 350);
  } else {
    finish();
  }
  let finished=false;
  function finish(){
    if(finished)return; finished=true;
    history.push({board:board.map(row=>[...row]),turn,castleRights:JSON.parse(JSON.stringify(castleRights)),enPassant,moveLog:JSON.parse(JSON.stringify(moveLog))});
    const[nb,newEp]=applyMove(board,sr,sc,nr,nc,finalPromo,enPassant);
    // Record before updating board state
    recordMove(sr,sc,nr,nc,movingPiece,capturedPiece&&color(capturedPiece)!==color(movingPiece)?capturedPiece:null,finalPromo,nb);
    board=nb; enPassant=newEp;
    if(board[nr][nc]==='wK'){castleRights.w.k=false;castleRights.w.q=false;}
    if(board[nr][nc]==='bK'){castleRights.b.k=false;castleRights.b.q=false;}
    if(sr===7&&sc===0)castleRights.w.q=false;if(sr===7&&sc===7)castleRights.w.k=false;
    if(sr===0&&sc===0)castleRights.b.q=false;if(sr===0&&sc===7)castleRights.b.k=false;
    turn=opponent(turn); selected=null; highlightMoves=[]; blockedMoves=[];
    checkGameOver();
    rebuildPieces();
    renderSquares();

    const crossedWall=(sr<=3&&nr>=4)||(sr>=4&&nr<=3);
    if(isDonActive()&&crossedWall&&!gameOver&&Math.random()<0.5&&!board[sr][sc]){
      setTimeout(()=>{
        const bouncedPiece=board[nr][nc];
        if(!bouncedPiece){if(afterFn)afterFn();return;}
        board[nr][nc]=null;
        board[sr][sc]=bouncedPiece;
        turn=opponent(turn); // undo the turn switch
        rebuildPieces();
        renderSquares();
        cheatMsg('🧱 DEPORTED BACK ACROSS THE WALL','#ff6a00');
        showBotChat('onWall');
        if(shouldBotMove()) doBotMove();
        else if(afterFn) afterFn();
      },400);
    } else {
      if(cvcMode){ setTimeout(cvcAfterChessMove,100); }
      else if(afterFn) afterFn();
      else if(shouldBotMove()) doBotMove();
    }
  }
}

const THEMES=[
  {l:'#cce0ff',d:'#1a5fa8',name:'Stevenson'},
  {l:'#f0d9b5',d:'#b58863',name:'Walnut'},
  {l:'#dfe0c8',d:'#4a7fa5',name:'Ocean'},
  {l:'#e8e8e8',d:'#4a4a4a',name:'Stone'},
  {l:'#f5e6c8',d:'#b07a3e',name:'Bronze'},
  {l:'#f0e0e0',d:'#a04040',name:'Ruby'},
  {l:'#e8e0f0',d:'#6a4a9a',name:'Amethyst'},
  {l:'#dde6f0',d:'#2a5a8a',name:'Sapphire'},
  {l:'#d8f0e0',d:'#2a7a4a',name:'Jade'},
  {l:'#1a1a2e',d:'#16213e',name:'Midnight'},
  {l:'#ffffff',d:'#b22234',name:'🇺🇸 USA',usflag:true},
];
let themeIdx=0;
let sColor='#ff7a00';

function togglePicker(){const p=document.getElementById('picker');p.style.display=p.style.display==='none'?'flex':'none';}

function savePrefs(){ try{ localStorage.setItem('chess_themeIdx', themeIdx); localStorage.setItem('chess_sColor', sColor); }catch(e){} }
function loadPrefs(){
  try{
    const t=localStorage.getItem('chess_themeIdx');
    if(t!==null){ const n=parseInt(t); if(n>=0&&n<THEMES.length) themeIdx=n; }
    const s=localStorage.getItem('chess_sColor');
    if(s) sColor=s;
  }catch(e){}
}

function buildSwatches(){
  const el=document.getElementById('theme-swatches');el.innerHTML='';
  THEMES.forEach((t,i)=>{
    const w=document.createElement('div');w.title=t.name;
    // US flag swatch gets a special mini flag look
    if(t.usflag){
      w.style.cssText=`width:20px;height:20px;cursor:pointer;border:2px solid ${i===themeIdx?'#c9a84c':'rgba(201,168,76,0.2)'};border-radius:2px;overflow:hidden;position:relative;background:#b22234;`;
      w.innerHTML=`<div style="position:absolute;top:0;left:0;width:50%;height:100%;background:#3c3b6e;"></div><div style="position:absolute;top:0;left:0;width:50%;height:50%;background:#3c3b6e;font-size:7px;line-height:10px;text-align:center;color:#fff;">★</div>`;
    } else {
      w.style.cssText=`width:20px;height:20px;cursor:pointer;border:2px solid ${i===themeIdx?'#c9a84c':'rgba(201,168,76,0.2)'};border-radius:2px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;`;
      w.innerHTML=`<div style="background:${t.l}"></div><div style="background:${t.d}"></div><div style="background:${t.d}"></div><div style="background:${t.l}"></div>`;
    }
    w.onclick=()=>{ themeIdx=i; renderSquares(); buildSwatches(); savePrefs(); };
    el.appendChild(w);
  });
}

const S_COLORS=[{name:'Orange',value:'#ff7a00'},{name:'Blue',value:'#1a5fa8'},{name:'Yellow',value:'#f5c400'},{name:'Black',value:'#111111'},{name:'Brown',value:'#7a3b10'}];

function buildSSwatches(){
  const el=document.getElementById('s-swatches');if(!el)return;el.innerHTML='';
  S_COLORS.forEach(col=>{
    const dot=document.createElement('div');dot.title=col.name;
    dot.style.cssText=`width:18px;height:18px;border-radius:50%;background:${col.value};cursor:pointer;border:2px solid ${sColor===col.value?'#c9a84c':'rgba(201,168,76,0.2)'};box-shadow:0 1px 4px rgba(0,0,0,0.4);`;
        dot.onclick=()=>{ sColor=col.value; document.getElementById('s-letter').style.color=sColor; buildSSwatches(); savePrefs(); };
    el.appendChild(dot);
  });
}

function isUSBundleActive(){
  const check=i=>i>=0&&BOTS[i]&&(BOTS[i].isTrump||BOTS[i].isBiden||BOTS[i].isElon);
  return check(botIdx)||check(whiteBotIdx);
}

// US Flag square color: stripes + blue canton (top-left 3 cols, top 4 rows)
function usFlagSquareColor(r,c){
  // Canton: top-left 3 columns, top 4 rows = navy blue with star hint
  if(r<4&&c<3){
    // Checkerboard within canton: alternate slightly lighter/darker navy
    return (r+c)%2===0?'#2a3f8f':'#1a2d6e';
  }
  // Stripes: alternate red & white by row, offset for canton rows
  const stripeRow = (r<4&&c>=3) ? r : r; // same row index
  return stripeRow%2===0?'#b22234':'#ffffff';
}

function renderSquares(){
  const boardEl=document.getElementById('board');
  boardEl.innerHTML='';
  const kingPos=findKing(board,turn);
  const[kr,kc]=kingPos||[-1,-1];
  const inCheck=kingPos?isInCheck(board,turn):false;
  const usFlag = THEMES[themeIdx].usflag || isUSBundleActive();
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){
    const sq=document.createElement('div');
    sq.className='sq '+((r+c)%2===0?'light':'dark');
    sq.style.width=sqSize+'px'; sq.style.height=sqSize+'px';
    if(usFlag){
      sq.style.background=usFlagSquareColor(r,c);
      sq.style.boxSizing='border-box';
      sq.style.border='1px solid #000';
      // Star emoji overlay for canton squares
      if(r<4&&c<3){
        sq.style.position='relative';
        const star=document.createElement('div');
        star.style.cssText='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:'+Math.round(sqSize*0.28)+'px;pointer-events:none;opacity:0.55;z-index:0;';
        star.textContent='★';
        sq.appendChild(star);
      }
    } else {
      sq.style.background=(r+c)%2===0?THEMES[themeIdx].l:THEMES[themeIdx].d;
      sq.style.border='';
    }
    if(selected&&selected[0]===r&&selected[1]===c)sq.classList.add('selected');
    const isMove=highlightMoves&&highlightMoves.find(m=>Array.isArray(m)?m[0]===r&&m[1]===c:m.r===r&&m.c===c);
    if(isMove){
      const isCap=Array.isArray(isMove)?!!(board[r][c]&&color(board[r][c])!==turn):!!isMove.cap;
      if(isCap)sq.classList.add('capture');else sq.classList.add('movable');
    }
    if(blockedMoves&&blockedMoves.find(([nr,nc])=>nr===r&&nc===c))sq.classList.add('blocked-move');
    if(inCheck&&r===kr&&c===kc)sq.classList.add('check');
    sq.addEventListener('click',()=>handleClick(r,c));
    boardEl.appendChild(sq);
  }
  const ranksEl=document.getElementById('ranks');ranksEl.innerHTML='';
  for(let r=0;r<8;r++){const d=document.createElement('div');d.className='rank-label';d.style.height=sqSize+'px';d.style.lineHeight=sqSize+'px';d.textContent=8-r;ranksEl.appendChild(d);}
  const filesEl=document.getElementById('files');filesEl.innerHTML='';
  'abcdefgh'.split('').forEach(f=>{const d=document.createElement('div');d.className='file-label';d.style.width=sqSize+'px';d.textContent=f;filesEl.appendChild(d);});
  if(cvcMode){
    document.getElementById('status').textContent=gameOver?'':(cvcCheckersTurn?'Checkers (Black)':'Chess (White)')+' to move';
  } else {
    const inCheck2=isInCheck(board,turn);
    document.getElementById('status').textContent=gameOver?'':(turn==='w'?'White':'Black')+' to move'+(inCheck2?' · Check':'');
  }
  syncHistoryPanelHeight();
}

function syncHistoryPanelHeight(){
  const boardSize=sqSize*8;
  const panel=document.getElementById('move-history-panel');
  panel.style.height=(boardSize+4)+'px';
  const cp=document.getElementById('chat-log-panel');
  if(cp) cp.style.height=(boardSize+4)+'px';

  // Wall overlay: sits exactly between row 4 and row 5 (after 4 squares), 1/8 sqSize tall
  const wallEl=document.getElementById('wall-overlay');
  if(isDonActive()){
    const wallH=Math.max(4, Math.round(sqSize/8));
    wallEl.style.top=(sqSize*4 - Math.floor(wallH/2))+'px';
    wallEl.style.height=wallH+'px';
    wallEl.classList.add('visible');
  } else {
    wallEl.classList.remove('visible');
  }
}