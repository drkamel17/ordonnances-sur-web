Traceback (most recent call last):
  File "<string>", line 1, in <module>
    import json; import sys; sys.stdout.reconfigure(encoding='utf-8'); data=json.load(open('ordonnances-types.json', encoding='utf-8')); print('const ordonnancesTypesData = ' + json.dumps(data, ensure_ascii=False) + ';\nwindow.ordonnancesTypesLoaded = true;')
                                                                            ~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Python314\Lib\json\__init__.py", line 293, in load
    return loads(fp.read(),
                 ~~~~~~~^^
  File "<frozen codecs>", line 325, in decode
UnicodeDecodeError: 'utf-8' codec can't decode byte 0xb5 in position 6114: invalid start byte
